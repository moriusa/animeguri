"use client";
import React, { useState } from "react";
import { Input } from "../common";
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormResetField,
} from "react-hook-form";
import { PostFormValues } from "@/post/page";

interface Props {
  register: UseFormRegister<PostFormValues>;
  error: FieldErrors<PostFormValues>;
  resetField: UseFormResetField<PostFormValues>;
  clearErrors: UseFormClearErrors<PostFormValues>;
  index: number;
}

export const RegionInput = ({
  register,
  error,
  resetField,
  clearErrors,
  index,
}: Props) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      // チェックがオンになった場合、日本の入力フィールドをクリアしエラーをリセット
      resetField(`reports.${index}.prefecture`);
      resetField(`reports.${index}.city`);
      clearErrors([`reports.${index}.prefecture`]);
    } else {
      // チェックがオフになった場合、海外フィールドをクリア
      resetField(`reports.${index}.overseasRegion`);
      clearErrors([`reports.${index}.overseasRegion`]);
    }
  };
  return (
    <div>
      {isChecked ? (
        <div className="mt-8">
          <Input
            id={`reports.${index}.overseasRegion`}
            text="聖地の場所"
            name={`reports.${index}.overseasRegion`}
            register={register}
            placeholder="地名を入力"
            validation={{ required: "聖地の場所を入力してください" }}
            error={error.reports?.[index]?.overseasRegion?.message}
          />
        </div>
      ) : (
        <div className="mt-8">
          <label htmlFor={`JPRegion-${index}`}>
            <div className="flex gap-2 items-center">
              <p className="font-bold">聖地の場所</p>
              {error && (
                <p className="text-red-500 text-xs">
                  {error.reports?.[index]?.prefecture?.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <select
                id={`JPRegion-${index}`}
                {...register(`reports.${index}.prefecture`, {
                  required: "都道府県は必須です",
                })}
                className="bg-white flex-1/3 w-full rounded-sm border border-gray-300 p-1 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60"
              >
                <option value="" disabled>
                  都道府県を選択
                </option>
                <option value="北海道">北海道</option>
                <option value="青森県">青森県</option>
                <option value="岩手県">岩手県</option>
                <option value="宮城県">宮城県</option>
                <option value="秋田県">秋田県</option>
                <option value="山形県">山形県</option>
                <option value="福島県">福島県</option>
                <option value="茨城県">茨城県</option>
                <option value="栃木県">栃木県</option>
                <option value="群馬県">群馬県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="新潟県">新潟県</option>
                <option value="富山県">富山県</option>
                <option value="石川県">石川県</option>
                <option value="福井県">福井県</option>
                <option value="山梨県">山梨県</option>
                <option value="長野県">長野県</option>
                <option value="岐阜県">岐阜県</option>
                <option value="静岡県">静岡県</option>
                <option value="愛知県">愛知県</option>
                <option value="三重県">三重県</option>
                <option value="滋賀県">滋賀県</option>
                <option value="京都府">京都府</option>
                <option value="大阪府">大阪府</option>
                <option value="兵庫県">兵庫県</option>
                <option value="奈良県">奈良県</option>
                <option value="和歌山県">和歌山県</option>
                <option value="鳥取県">鳥取県</option>
                <option value="島根県">島根県</option>
                <option value="岡山県">岡山県</option>
                <option value="広島県">広島県</option>
                <option value="山口県">山口県</option>
                <option value="徳島県">徳島県</option>
                <option value="香川県">香川県</option>
                <option value="愛媛県">愛媛県</option>
                <option value="高知県">高知県</option>
                <option value="福岡県">福岡県</option>
                <option value="佐賀県">佐賀県</option>
                <option value="長崎県">長崎県</option>
                <option value="熊本県">熊本県</option>
                <option value="大分県">大分県</option>
                <option value="宮崎県">宮崎県</option>
                <option value="鹿児島県">鹿児島県</option>
                <option value="沖縄県">沖縄県</option>
              </select>
              <input
                type="text"
                id="JPRegion"
                className="bg-white w-full rounded-sm border border-gray-300 p-1 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60"
                placeholder="市区町村など"
                {...register(`reports.${index}.city`)}
              />
            </div>
          </label>
        </div>
      )}
      <label className="mt-1 inline-block">
        <input
          type="checkbox"
          onChange={handleCheckboxChange}
          checked={isChecked}
        />
        日本以外の聖地
      </label>
    </div>
  );
};
