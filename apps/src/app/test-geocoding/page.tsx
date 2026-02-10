import { MapView } from "@/components/map/MapView";

export default function TestMapPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">地図表示テスト</h1>

      {/* テスト1: デフォルト設定 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">1. デフォルト（東京中心）</h2>
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapView />
        </div>
      </div>

      {/* テスト2: 大阪中心 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">2. 大阪中心</h2>
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapView center={[135.5022, 34.6937]} zoom={12} />
        </div>
      </div>

      {/* テスト3: コントロールなし */}
      <div>
        <h2 className="text-xl font-semibold mb-2">3. コントロールなし</h2>
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapView showControls={false} />
        </div>
      </div>

      {/* 確認事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold mb-2">✅ 確認事項</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ 地図が表示されるか</li>
          <li>✅ ズーム・回転ボタンが右上に表示されるか</li>
          <li>✅ フルスクリーンボタンが表示されるか</li>
          <li>✅ 現在地ボタンをクリックすると位置情報を取得するか</li>
          <li>✅ 左下にスケール（距離）が表示されるか</li>
          <li>✅ マウスでドラッグ・ズームができるか</li>
        </ul>
      </div>
    </div>
  );
}