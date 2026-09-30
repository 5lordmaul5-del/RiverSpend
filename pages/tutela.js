import Head from 'next/head';

const sections = [
  ['Tutela di acquirenti e venditori', 'Consulta le regole della piattaforma, verifica descrizione e condizioni dell’articolo e conserva le comunicazioni relative alla transazione.'],
  ['Privacy e dati personali', 'Qui saranno disponibili l’informativa sul trattamento dei dati, i diritti degli utenti e i contatti privacy. Per informazioni sul Garante: https://www.garanteprivacy.it/.'],
  ['Controversie e reclami', 'In caso di problema, prepara il riferimento dell’ordine o dell’annuncio, una descrizione dei fatti e le prove pertinenti. Il modulo di apertura e tracciamento delle pratiche dovrà essere collegato.'],
  ['Resi e rimborsi', 'Le regole dipendono dal tipo di venditore, dal contratto e dalle circostanze. Le vendite tra privati non seguono automaticamente le stesse regole delle vendite professionali. La procedura effettiva e i tempi dovranno essere pubblicati dopo verifica.'],
  ['Pagamenti e sicurezza', 'Controlla importo e stato della transazione. Per operazioni non riconosciute, contatta subito il prestatore di servizi di pagamento e segnala il caso a RiverSpend.'],
  ['Corrieri e spedizioni', 'Conserva il tracking e la prova di consegna. Per pacchi smarriti, non consegnati o danneggiati occorre seguire la procedura prevista dal servizio di spedizione utilizzato.'],
  ['Segnalazioni', 'Gli utenti potranno segnalare annunci, contenuti o comportamenti sospetti attraverso gli strumenti ufficiali della piattaforma. Il modulo deve essere collegato prima dell’attivazione.'],
  ['Contatti e assistenza', 'I recapiti ufficiali devono essere inseriti e verificati prima della pubblicazione: ragione sociale, indirizzo, email di assistenza ed eventuale PEC.'],
  ['Ruoli e responsabilità', 'I ruoli di RiverSpend, venditori, acquirenti e corrieri devono essere descritti in modo preciso e coerente con i servizi realmente offerti e con la normativa applicabile. Non è valido un esonero generale dagli obblighi previsti dalla legge.'],
];

export default function TutelaAssistenza() {
  return <>
    <Head><title>Tutela e Assistenza | RiverSpend</title><meta name="description" content="Informazioni e assistenza RiverSpend: tutela, privacy, controversie, rimborsi, pagamenti e spedizioni." /></Head>
    <main className="rs-tutela">
      <div className="rs-tutela-wrap">
        <a className="rs-back" href="/">← Torna a RiverSpend</a>
        <header className="rs-tutela-hero">
          <div className="rs-kicker">RIVERSPEND · YOUR SHOP • YOUR FLOW</div>
          <h1>Tutela e Assistenza</h1>
          <p>Un punto unico per trovare informazioni, chiedere assistenza e segnalare un problema relativo a un annuncio, un acquisto, un pagamento o una spedizione.</p>
          <div className="rs-tutela-note"><strong>Informazione importante.</strong> Le tutele applicabili possono variare in base alla natura della vendita (privato o professionista), al servizio utilizzato e alla normativa applicabile. Questa pagina non sostituisce i Termini e condizioni né le informazioni legali specifiche.</div>
        </header>
        <section className="rs-tutela-grid" aria-label="Aree di tutela e assistenza">
          {sections.map(([title, body], i) => <article className="rs-tutela-card" key={title}>
            <span className="rs-tutela-num">{String(i + 1).padStart(2, '0')}</span>
            <h2>{title}</h2><p>{body}</p>
            {i === 1 && <a href="https://www.garanteprivacy.it/" target="_blank" rel="noreferrer">Sito del Garante Privacy ↗</a>}
          </article>)}
        </section>
        <div className="rs-tutela-warning"><strong>Pagina in completamento:</strong> i moduli di controversia, reclamo, rimborso e contatto non sono ancora collegati. Prima di pubblicare i testi definitivi vanno inseriti i dati ufficiali di RiverSpend e verificati i processi e gli obblighi legali applicabili.</div>
        <footer>RiverSpend · Tutela e Assistenza</footer>
      </div>
      <style jsx>{`
        .rs-tutela{min-height:100vh;background:linear-gradient(180deg,#c9f5f3 0%,#e9fbfa 360px,#fff 100%);color:#173b43;font-family:Arial,Helvetica,sans-serif;padding:22px 14px 50px}
        .rs-tutela-wrap{max-width:1050px;margin:auto}.rs-back{display:inline-block;color:#087f83;font-weight:700;text-decoration:none;margin:4px 0 16px}
        .rs-tutela-hero{background:rgba(255,255,255,.88);border:1px solid #b8e5e1;border-radius:24px;padding:clamp(22px,5vw,42px);box-shadow:0 12px 32px #176b7012}
        .rs-kicker{font-size:12px;letter-spacing:2px;font-weight:800;color:#168589}.rs-tutela h1{font-size:clamp(32px,6vw,48px);line-height:1.1;margin:12px 0;color:#143e45}.rs-tutela-hero>p{font-size:17px;max-width:760px}
        .rs-tutela-note{margin-top:20px;padding:15px 17px;border-left:4px solid #c99b35;background:#fff8e8;border-radius:9px;font-size:14px}
        .rs-tutela-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:14px;margin:20px 0}
        .rs-tutela-card{position:relative;background:#fff;border:1px solid #c5e8e4;border-radius:17px;padding:21px;box-shadow:0 6px 20px #176b700b}
        .rs-tutela-num{font-size:12px;font-weight:800;color:#c0922d;letter-spacing:1px}.rs-tutela h2{font-size:19px;margin:7px 0;color:#087f83}.rs-tutela-card p{margin:0;line-height:1.6}.rs-tutela-card a{display:inline-block;margin-top:10px;color:#087f83;font-weight:700}
        .rs-tutela-warning{padding:17px;border:1px dashed #8ccbc5;background:#effdfb;border-radius:12px;font-size:14px}footer{border-top:1px solid #c5e8e4;margin-top:28px;padding-top:18px;color:#54777b;font-size:13px}
      `}</style>
    </main>
  </>;
}
