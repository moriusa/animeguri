"use client";
import { ExtractedMetadata, TextArea, UploadImage } from ".";
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
import { authFetcher } from "@/lib/fetcher";
import { useConfirm } from "../common/ConfirmDialog";
import { MarkdownRenderer } from "../article/MarkdownRederer";

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
  const confirm = useConfirm();
  const [citiesMap, setCitiesMap] = useState<Record<string, string[]>>(
    cachedCitiesMap ?? {},
  );
  const [citiesLoading, setCitiesLoading] = useState(!cachedCitiesMap);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [isAutoAddressEnabled, setIsAutoAddressEnabled] =
    useState<boolean>(false);

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

  const handleMetadataExtracted = async (meta: ExtractedMetadata) => {
    if (!isAutoAddressEnabled) return;

    setValue(`reports.${index}.latitude`, meta.lat);
    setValue(`reports.${index}.longitude`, meta.lng);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

      type Res = {
        place: {
          prefecture: string;
          subRegion: string;
          municipality: string;
          street: string;
          addressNumber: string;
          label: string;
        };
      };

      const response = await authFetcher<Res>(
        `${API_BASE_URL}/geocode/reverse?lat=${meta.lat}&lng=${meta.lng}`,
      );

      // 2 Lambdaから送られてくる { place: { prefecture, municipality, ... } } の構造を受け取る
      if (response && response.place) {
        console.log(response);
        const {
          prefecture,
          subRegion,
          municipality,
          street,
          addressNumber,
          label,
        } = response.place;

        // 3. 都道府県を自動セット (例: "神奈川県")
        if (prefecture) {
          setValue(`reports.${index}.prefecture`, prefecture);
        }

        // 4. 市区町村を自動セット (例: "足柄上郡大井町")
        // Geoloniaのマスターデータ（citiesMap）の表記に合わせるため、
        // subRegion（郡など）が存在する場合は結合（郡 + 市区町村）してマッチングさせます
        const availableCities = citiesMap[prefecture] || [];
        const fullCityName = subRegion
          ? `${subRegion}${municipality}`
          : municipality;

        // 完全一致、または部分一致でセレクトボックスの値と合致するものを探す
        const foundCity = availableCities.find(
          (city) => city === fullCityName || city === municipality,
        );

        if (foundCity) {
          setValue(`reports.${index}.city`, foundCity);
        } else {
          // 万が一見つからなかった場合は安全のため空にしてユーザーに選ばせる
          setValue(`reports.${index}.city`, "");
        }

        // 5. 町名・番地を自動セット (例: "河原町123")
        // AWSからパーツごとに綺麗に分かれて届くので、合体させてインプットに流し込みます
        const streetAddress = `${street || ""}${addressNumber || ""}`;
        setValue(`reports.${index}.streetAddress`, streetAddress);

        // 6. 周辺のスポット名（施設名）が取れていれば自動入力
        // AWSのラベルに観光地や駅名が入っている場合、それを「スポット名称」の初期値に
        if (
          label &&
          !label.includes(prefecture || "") &&
          !label.includes(municipality || "")
        ) {
          setValue(`reports.${index}.spotName`, label);
        }
        await confirm({
          type: "alert",
          title: "住所自動入力に成功",
          description: `巡礼レポート ${index + 1}：写真の位置から住所を自動入力しました！`,
          confirmText: "閉じる",
          confirmVariant: "default",
        });
        return;
      }

      await confirm({
        type: "alert",
        title: "住所自動入力に失敗しました。",
        description: `写真に位置情報はありましたが、住所を特定できませんでした。`,
        confirmText: "閉じる",
        confirmVariant: "default",
      });
    } catch (err) {
      await confirm({
        type: "alert",
        title: "住所の自動入力中にエラーが発生しました",
        description: String(err),
        confirmText: "閉じる",
        confirmVariant: "default",
      });
    }
  };
  return (
    <div className="p-4 mb-4 bg-white rounded border">
      <h2 className="font-bold text-lg mb-2">巡礼レポート {index + 1}</h2>
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

      {/* 画像アップロード */}
      <div className="mt-4">
        <UploadImage
          maxFiles={10}
          error={errors.reports?.[index]?.images?.message}
          register={register}
          images={reportData.images}
          onChange={onImageChange}
          reportIdx={index}
          errors={errors}
          onMetadataExtracted={
            isAutoAddressEnabled ? handleMetadataExtracted : undefined
          }
        />
      </div>

      <div className="flex items-center space-x-3 bg-gray-50 p-2 px-3 rounded border border-gray-200 w-fit select-none mt-4">
        <span className="text-xs text-gray-600 tracking-wider">
          画像から住所を自動入力:
          <span
            className={`ml-1 font-bold ${isAutoAddressEnabled ? "text-yellow-600" : "text-gray-400"}`}
          >
            {isAutoAddressEnabled ? "ON" : "OFF"}
          </span>
        </span>

        <button
          type="button"
          onClick={() => setIsAutoAddressEnabled(!isAutoAddressEnabled)}
          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isAutoAddressEnabled ? "bg-yellow-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isAutoAddressEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
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
          value={reportData.description}
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
