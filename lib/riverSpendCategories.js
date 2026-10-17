export const riverSpendCategorySections = [
  ['👩 DONNA', ['Abbigliamento Donna','Scarpe Donna','Borse Donna','Accessori Donna','Gioielli Donna','Orologi Donna','Bellezza & Make-up Donna','Cura personale Donna','Intimo Donna','Sport & Benessere Donna','Maternità & Premaman']],
  ['👨 UOMO', ['Abbigliamento Uomo','Scarpe Uomo','Borse Uomo','Accessori Uomo','Gioielli Uomo','Orologi Uomo','Bellezza & Cura personale Uomo','Intimo Uomo','Sport & Benessere Uomo']],
  ['👶 BAMBINI', ['Abbigliamento Bambini','Scarpe Bambini','Borse & Accessori Bambini','Gioielli & Orologi Bambini','Giochi & Giocattoli','Prima infanzia','Passeggini & Seggiolini','Camerette Bambini','Scuola & Cartoleria','Sport & Benessere Bambini']],
  ['🧸 GIOCHI & TEMPO LIBERO', ['Giochi & Giocattoli','Hobby & Modellismo','Gadget & Regali','Viaggi & Valigeria','Biciclette & Mobilità','Strumenti musicali','Articoli da festa']],
  ['🏠 CASA & ARREDAMENTO', ['Casa & Arredamento','Mobili','Cucina','Elettrodomestici','Fai da te & Ferramenta','Giardino','Illuminazione','Tessile casa','Bagno','Decorazioni & Complementi','Pulizia casa','Sicurezza domestica','Utensili']],
  ['📱 TECNOLOGIA', ['Elettronica & Informatica','Smartphone & Telefonia','Computer & Notebook','Tablet & E-reader','Gaming','Console & Videogiochi','Fotografia & Video','Musica & Audio','TV & Home cinema','Componenti PC','Stampanti & Scanner','Accessori elettronici','Smart Home']],
  ['⚽ SPORT & BENESSERE', ['Sport','Arti marziali & Combattimento','Fitness & Palestra','Outdoor & Avventura','Pesca','Caccia & Accessori consentiti','Integratori','Ciclismo','Calcio','Tennis & Padel','Sport acquatici','Campeggio & Trekking','Yoga & Pilates','Attrezzatura sportiva']],
  ['🚗 AUTO & VEICOLI', ['Auto','Moto','Scooter','Harley & Custom','Camion & Veicoli commerciali','Trattori & Agricoltura','Edilizia & Macchine da lavoro','Ricambi & Accessori auto','Ricambi & Accessori moto','Pneumatici & Cerchi','Caravan & Camper','Biciclette elettriche','Ricambi veicoli commerciali']],
  ['🚤 NAUTICA & TRASPORTI', ['Nautica','Navale','Barche & Gommoni','Motori marini','Accessori nautici','Attrezzatura subacquea','Aeronautica','Militaria & Storia']],
  ['🐾 ANIMALI', ['Cani','Gatti','Altri animali domestici','Accessori per animali','Cucce & Trasportini','Acquari & Pesci','Equitazione']],
  ['📚 CULTURA & COLLEZIONISMO', ['Libri & Cultura','Libri scolastici','Fumetti & Manga','Arte','Antiquariato','Collezionismo','Vintage & Second hand','Vinili & CD','Francobolli & Monete','Carte collezionabili']],
  ['💼 LAVORO & IMPRESA', ['Ufficio & Professionale','Industria','Attrezzature professionali','Energia & Smart Home','Servizi digitali','Attrezzature per negozi','Arredi ufficio','Macchine professionali']],
  ['🍎 ALIMENTARI & BEVANDE', ['Alimentari confezionati','Pasta, Riso & Cereali','Pane & Prodotti da forno','Dolci, Biscotti & Cioccolato','Caffè, Tè & Infusi','Conserve, Salse & Condimenti','Olio, Aceto & Spezie','Frutta & Verdura','Formaggi & Latticini','Salumi & Gastronomia','Carne & Pesce confezionati','Prodotti biologici','Prodotti tipici & Regionali','Acqua','Bibite analcoliche','Succhi & Bevande alla frutta','Birra','Vini & Spumanti','Liquori & Distillati','Bevande & Vini da collezione']],
  ['🎁 ALTRO', ['Altro']],
  ['🔞 ADULTI', ['18🔞 Sex Toys']]
];
export const riverSpendCategories = [...new Set(riverSpendCategorySections.flatMap(([, items]) => items))];
