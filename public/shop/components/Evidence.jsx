import React from 'react';

/**
 * Evidence Component
 * - サイト上に東北大学等の研究結果を掲載するためのセクション
 * - 研究サマリー、主要指標、ダウンロード（レポート）リンク、今後の予定を表示
 */
function Evidence() {
  return (
    <section id="evidence" className="evidence">
      <div className="container">
        <h3 className="section-title">研究・科学的エビデンス</h3>

        <div className="evidence-grid">
          <div className="evidence-summary">
            <p>
              当サイトでは、東北大学等の研究機関と協力して当農園の栽培手法や作物の
              栄養価・土壌の状態に関する科学的評価を行う予定です。下記は準備中のサンプル
              表示です。研究結果を受け取り次第、ここに要約とフルレポートを公開します。
            </p>

            <ul>
              <li><strong>目的：</strong>栽培手法が作物の栄養価・土壌微生物群集に与える影響を評価</li>
              <li><strong>主な評価項目：</strong>ビタミン類、ミネラル、抗酸化指標、土壌微生物多様性</li>
              <li><strong>提出物：</strong>査読前レポート（PDF）、データセット（CSV）</li>
            </ul>

            <div style={{ marginTop: 12 }}>
              <a className="btn-primary" href="/evidence/README.md" target="_blank" rel="noreferrer">レポート置き場（準備中）</a>
            </div>
          </div>

          <div className="evidence-metrics">
            <h4>主要メトリクス（例）</h4>
            <dl>
              <dt>サンプル数</dt>
              <dd>n = 30（品目・季節により変動）</dd>
              <dt>取得データ</dt>
              <dd>栄養成分分析、土壌分析、微生物解析、収量データ</dd>
              <dt>公開予定</dt>
              <dd>2026年第1四半期（目標）</dd>
            </dl>
          </div>
        </div>

        <div className="evidence-note" style={{ marginTop: 20 }}>
          <p>
            ※本ページは研究結果の公開準備ページです。具体的な解析結果およびフルレポートは
            研究機関からの成果受領後に公開します。データ共有や共同研究に関する問い合わせは
            <a href="#contact">お問い合わせ</a>よりご連絡ください。
          </p>
        </div>
      </div>
    </section>
  );
}

export default Evidence;
