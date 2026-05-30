const Page = () => {
  return (
    <div className="md:p-10 max-w-3xl mx-auto">
      <div className="bg-white md:px-4 py-10 text-center">
        <p className="font-bold text-xl">お問い合わせ</p>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdzRZEy7I-0I19djqLhmc06FXQfuH3DNMbxkqvDRiyBHAZurA/viewform?embedded=true"
          height="1100"
          className="w-full mt-8"
        >
          読み込んでいます…
        </iframe>
      </div>
    </div>
  );
};

export default Page;
