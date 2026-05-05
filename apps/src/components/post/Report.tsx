"use client";
import { TextArea, UploadImage } from ".";
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormResetField,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FaRegTrashCan } from "react-icons/fa6";
import { Input } from "../common";
import { ImageItem, PostFormValues, ReportTypes } from "./PostFrom";
import { useEffect, useState } from "react";
import { SelectField } from "./SelectField";

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;
// Geolonia API から取得した全データをモジュールレベルでキャッシュ
// → 同一ページ内で複数の Report が存在しても API 呼び出しは1回だけ
let cachedCitiesMap: Record<string, string[]> | null = null;
let fetchPromise: Promise<Record<string, string[]>> | null = null;

const fetchCitiesMap = (): Promise<Record<string, string[]>> => {
  if (cachedCitiesMap) return Promise.resolve(cachedCitiesMap);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(
    "https://geolonia.github.io/japanese-addresses/api/ja.json",
  )
    .then((res) => {
      if (!res.ok) throw new Error("住所データの取得に失敗しました");
      return res.json() as Promise<Record<string, string[]>>;
    })
    .then((data) => {
      cachedCitiesMap = data;
      return data;
    });

  return fetchPromise;
};

export const Report = ({
  index,
  onDelete,
  register,
  errors,
  onImageChange,
  reportData,
  watch,
  setValue,
}: {
  index: number;
  onDelete: (index: number) => void;
  register: UseFormRegister<PostFormValues>;
  resetField: UseFormResetField<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  onImageChange: (index: number, images: ImageItem[]) => void;
  reportData: ReportTypes;
  watch: UseFormWatch<PostFormValues>;
  setValue: UseFormSetValue<PostFormValues>;
}) => {
  const [citiesMap, setCitiesMap] = useState<Record<string, string[]>>(
    cachedCitiesMap ?? {},
  );
  const [citiesLoading, setCitiesLoading] = useState(!cachedCitiesMap);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // 初回マウント時にAPIからデータ取得（キャッシュ済みなら即反映）
  useEffect(() => {
    if (cachedCitiesMap) return;
    fetchCitiesMap()
      .then(setCitiesMap)
      .catch(() => setCitiesError("市区町村データの取得に失敗しました"))
      .finally(() => setCitiesLoading(false));
  }, []);

  // 選択中の都道府県を監視
  const selectedPrefecture = watch(`reports.${index}.prefecture`);

  const handlePrefectureChange = () => {
    setValue(`reports.${index}.city`, "");
  };

  // 選択中の都道府県に対応する市区町村リスト
  const cities =
    selectedPrefecture && citiesMap[selectedPrefecture]
      ? citiesMap[selectedPrefecture]
      : [];
  return (
    <div className="p-4 mb-4 bg-white rounded border">
      <h2 className="font-bold text-lg mb-2">巡礼レポート {index + 1}</h2>

      {/* 画像アップロード */}
      <UploadImage
        maxFiles={10}
        error={errors.reports?.[index]?.images?.message}
        register={register}
        images={reportData.images}
        onChange={onImageChange}
        reportIdx={index}
        errors={errors}
      />

      {/* タイトル */}
      <div className="mt-8">
        <Input
          id={"reportTitle"}
          text="タイトル"
          name={`reports.${index}.title`}
          register={register}
          placeholder="タイトルを入力"
          validation={{ required: "タイトルを入力してください" }}
          error={errors?.reports?.[index]?.title?.message}
          required={true}
        />
      </div>

      {/* 聖地の場所 */}
      <div className="mt-8">
        <div className="sm:flex gap-3">
          {/* 都道府県 */}
          <SelectField
            id={`prefecture-${index}`}
            label="都道府県"
            name={`reports.${index}.prefecture`}
            register={register}
            validation={{ required: "都道府県を選択してください" }}
            error={errors?.reports?.[index]?.prefecture?.message}
            options={[...PREFECTURES]}
            placeholder="都道府県を選択"
            onChangeProp={handlePrefectureChange}
            required={true}
          />

          {/* 市区町村（都道府県連動） */}
          <SelectField
            id={`city-${index}`}
            label={citiesError ? "市区町村（取得失敗）" : "市区町村"}
            name={`reports.${index}.city`}
            register={register}
            validation={{ required: "市区町村を選択してください" }}
            error={errors?.reports?.[index]?.city?.message}
            options={cities}
            placeholder={
              citiesLoading
                ? "読み込み中…"
                : citiesError
                  ? "取得に失敗しました"
                  : selectedPrefecture
                    ? "市区町村を選択"
                    : "都道府県を先に選択"
            }
            disabled={citiesLoading || !!citiesError || !selectedPrefecture}
            required={true}
          />
        </div>

        {/* 町名・番地 */}
        <div className="mt-3">
          <Input
            id={`streetAddress-${index}`}
            text="町名・番地"
            name={`reports.${index}.streetAddress`}
            register={register}
            placeholder="例: 千代田1-1-1"
          />
        </div>

        {/* スポット名称 */}
        <div className="mt-3">
          <Input
            id={`spotName-${index}`}
            text="スポット名称"
            name={`reports.${index}.spotName`}
            register={register}
            placeholder="例: 〇〇神社、△△公園"
            validation={{ required: "スポット名称を入力してください" }}
            error={errors?.reports?.[index]?.spotName?.message}
            required={true}
          />
        </div>
      </div>

      {/* レポート内容 */}
      <div className="mt-8">
        <TextArea
          name={`reports.${index}.description`}
          register={register}
          text="説明"
          placeholder="この聖地はどうだった？"
        />
      </div>

      {/* 削除ボタン */}
      {index > 0 && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="mt-8 cursor-pointer text-red-600"
          >
            <FaRegTrashCan size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
