import React from 'react';

import Link from 'next/link';

import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import config from '../config/index.json';

const LAST_UPDATED = '6 settembre 2026';

const TITLE = 'Informativa sulla privacy | SKV Rent';
const DESCRIPTION =
  'Come SKV Rent tratta i dati personali raccolti tramite il modulo di contatto del sito: finalità, base giuridica, destinatari, tempi di conservazione e diritti dell’interessato.';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mt-10">
    <h2 className="font-display text-2xl font-bold tracking-tight text-border">
      {title}
    </h2>
    <div className="mt-3 space-y-3 text-gray-700">{children}</div>
  </section>
);

const Privacy = () => {
  const { company, about } = config;
  const { contact, legal } = about;

  return (
    <div className="bg-background">
      <PageMeta title={TITLE} description={DESCRIPTION} path="/privacy/" />

      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-6">
        <Link href="/" className="inline-flex" aria-label={company.name}>
          <img
            src="/assets/images/skv-logo-64w.webp"
            srcSet="/assets/images/skv-logo-64w.webp 64w, /assets/images/skv-logo-128w.webp 128w"
            sizes="48px"
            alt={company.name}
            className="h-12 w-12"
            width={48}
            height={48}
          />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:text-secondary"
        >
          Torna alla home
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-border">
          Informativa sulla privacy
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Ultimo aggiornamento: {LAST_UPDATED}
        </p>
        <p className="mt-6 text-gray-700">
          Questa informativa spiega come {company.legalName} tratta i dati
          personali di chi visita questo sito e di chi ci scrive tramite il
          modulo di contatto, ai sensi degli articoli 13 e 14 del Regolamento
          (UE) 2016/679 (GDPR).
        </p>

        <Section title="Chi tratta i tuoi dati">
          <p>
            Il titolare del trattamento è {company.legalName}, con sede in{' '}
            {contact.address}, P. IVA e C.F. {legal.vatId}, REA {legal.rea}.
          </p>
          <p>
            Puoi contattarci per qualsiasi questione relativa ai tuoi dati
            scrivendo a{' '}
            <a
              className="text-primary underline hover:text-secondary"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>{' '}
            oppure via PEC a{' '}
            <a
              className="text-primary underline hover:text-secondary"
              href={`mailto:${legal.pec}`}
            >
              {legal.pec}
            </a>
            . Non abbiamo nominato un responsabile della protezione dei dati,
            perché non ricorrono i casi previsti dall’articolo 37 del GDPR.
          </p>
        </Section>

        <Section title="Quali dati raccogliamo">
          <p>
            <strong className="font-semibold text-border">
              Dati che ci fornisci tu.
            </strong>{' '}
            Il modulo di contatto ha due varianti. Come cliente privato
            inserisci nome, cognome, indirizzo email, numero di telefono e il
            testo del messaggio. Come azienda inserisci ragione sociale, partita
            IVA, persona di contatto, indirizzo, email, telefono e il testo del
            messaggio. Il modulo registra anche il tipo di cliente scelto e la
            presa visione di questa informativa.
          </p>
          <p>
            <strong className="font-semibold text-border">
              Dati raccolti automaticamente.
            </strong>{' '}
            Come ogni sito web, il nostro fornitore di hosting registra i dati
            tecnici necessari a consegnare le pagine e a proteggere il servizio:
            indirizzo IP, data e ora della richiesta, pagina richiesta e tipo di
            browser. Non usiamo questi dati per identificarti né per costruire
            profili.
          </p>
        </Section>

        <Section title="Perché li trattiamo">
          <p>
            Usiamo i dati del modulo <strong>solo</strong> per rispondere alla
            tua richiesta e per prepararti un preventivo. La base giuridica è
            l’esecuzione di misure precontrattuali adottate su tua richiesta,
            articolo 6, paragrafo 1, lettera b) del GDPR.
          </p>
          <p>
            Trattiamo i dati tecnici di connessione per la sicurezza e il
            corretto funzionamento del sito, sulla base del nostro legittimo
            interesse a mantenerlo disponibile e protetto, articolo 6, paragrafo
            1, lettera f). Conserviamo la corrispondenza quando serve ad
            adempiere a un obbligo di legge o a difendere un nostro diritto,
            articolo 6, paragrafo 1, lettera c).
          </p>
          <p>
            Non usiamo i tuoi dati per inviarti comunicazioni commerciali, non
            li vendiamo e non li cediamo a terzi per finalità di marketing. Non
            adottiamo processi decisionali automatizzati né attività di
            profilazione.
          </p>
        </Section>

        <Section title="Se non ci fornisci i dati">
          <p>
            Compilare i campi contrassegnati come obbligatori è necessario per
            poterti rispondere: senza un recapito non possiamo darti riscontro.
            Non ci sono altre conseguenze se scegli di non scrivere.
          </p>
        </Section>

        <Section title="Chi altro vede i tuoi dati">
          <p>
            I messaggi inviati dal modulo passano attraverso{' '}
            <strong className="font-semibold text-border">Web3Forms</strong>, il
            servizio che li inoltra, e arrivano alla casella di posta aziendale,
            ospitata da{' '}
            <strong className="font-semibold text-border">Google</strong>. Il
            sito è pubblicato su{' '}
            <strong className="font-semibold text-border">GitHub Pages</strong>,
            che tratta i dati tecnici di connessione descritti sopra. Questi
            fornitori agiscono come responsabili del trattamento o come titolari
            autonomi per i propri servizi.
          </p>
          <p>
            Oltre a loro, ai dati accedono solo le persone di {company.name} che
            gestiscono le richieste dei clienti. Non diffondiamo i tuoi dati.
          </p>
          <p>
            Alcuni di questi fornitori possono trattare i dati anche al di fuori
            dello Spazio Economico Europeo. In quel caso il trasferimento
            avviene sulla base delle clausole contrattuali tipo approvate dalla
            Commissione europea o di un’altra garanzia adeguata prevista dal
            Capo V del GDPR.
          </p>
        </Section>

        <Section title="Per quanto tempo li conserviamo">
          <p>
            Conserviamo i dati del modulo per il tempo necessario a gestire la
            tua richiesta e, in seguito, per un massimo di 24 mesi dall’ultimo
            contatto, così da poter riprendere il discorso se ci riscrivi.
            Superato quel termine li cancelliamo, salvo che una norma di legge o
            la difesa di un diritto in sede giudiziaria ci imponga di
            conservarli più a lungo.
          </p>
        </Section>

        <Section title="I tuoi diritti">
          <p>
            In qualsiasi momento puoi chiederci l’accesso ai tuoi dati, la loro
            rettifica o cancellazione, la limitazione del trattamento e la
            portabilità, e puoi opporti al trattamento fondato sul legittimo
            interesse. Sono i diritti previsti dagli articoli da 15 a 22 del
            GDPR.
          </p>
          <p>
            Per esercitarli scrivi a{' '}
            <a
              className="text-primary underline hover:text-secondary"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
            . Ti risponderemo entro un mese. Se ritieni che il trattamento violi
            il GDPR puoi rivolgerti al Garante per la protezione dei dati
            personali, Piazza Venezia 11, 00187 Roma,{' '}
            <a
              className="text-primary underline hover:text-secondary"
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noreferrer"
            >
              garanteprivacy.it
            </a>
            , oppure ricorrere all’autorità giudiziaria.
          </p>
        </Section>

        <Section title="Cookie e strumenti di tracciamento">
          <p>
            Questo sito{' '}
            <strong className="font-semibold text-border">
              non installa cookie
            </strong>{' '}
            e non usa il browser per memorizzare informazioni sul tuo
            dispositivo. Non usiamo strumenti di statistica o di analisi del
            traffico, non ci sono pulsanti social che caricano contenuti di
            terze parti e i caratteri tipografici sono ospitati direttamente sul
            nostro dominio. Per questo non trovi alcun banner di consenso: non
            c’è nulla da consentire.
          </p>
          <p>
            I link a Instagram, Facebook, WhatsApp e Google Maps presenti nel
            sito ti portano su siti esterni. Da quel momento vale l’informativa
            del rispettivo gestore, sulla quale non abbiamo controllo.
          </p>
        </Section>

        <Section title="Modifiche a questa informativa">
          <p>
            Se cambieremo il modo in cui trattiamo i dati aggiorneremo questa
            pagina e la data indicata in alto. Ti invitiamo a rileggerla quando
            ci scrivi.
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
