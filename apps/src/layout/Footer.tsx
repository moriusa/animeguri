import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-secondary mt-10 text-white py-15">
      <div className="max-w-5xl mx-auto w-10/12 text-center">
        <div className="md:flex justify-between items-center text-sm">
          <Link href={"/"} className="cursor-pointer text-3xl font-bold">
            animeguri
          </Link>
          <div className="flex items-center flex-col gap-6 md:gap-10 md:flex-row mt-12 md:mt-0">
            <Link href={"/terms"} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              利用規約
            </Link>
            <Link href={"/privacy"} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              プライバシーポリシー
            </Link>
            <Link href={"/contact"} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              お問い合わせ/ご意見
            </Link>
          </div>
        </div>
        <small className="block mt-30">© 2026 animeguri.</small>
      </div>
    </footer>
  );
};
