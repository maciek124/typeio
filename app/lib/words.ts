export type Language = "en" | "pl";

const WORDS_EN = [
  "time","year","people","way","day","man","thing","woman","life","child",
  "world","school","state","family","student","group","country","problem","hand","part",
  "place","case","week","company","system","program","question","work","government","number",
  "night","point","home","water","room","mother","area","money","story","fact",
  "month","lot","right","study","book","eye","job","word","business","issue",
  "side","kind","head","house","service","friend","father","power","hour","game",
  "line","end","member","law","car","city","community","name","president","team",
  "minute","idea","kid","body","information","back","parent","face","others","level",
  "office","door","health","person","art","war","history","party","result","change",
  "morning","reason","research","girl","guy","moment","air","teacher","force","education",
  "foot","boy","age","policy","process","music","market","sense","nation","plan",
  "college","interest","death","experience","effect","use","class","control","care","field",
  "development","role","effort","rate","heart","drug","show","leader","light","voice",
  "wife","police","mind","price","report","decision","son","view","relationship","town",
  "road","arm","difference","value","building","action","season","society","tax","director",
  "position","player","record","paper","space","ground","form","event","matter","center",
  "couple","site","project","activity","star","table","need","court","oil","situation",
  "cost","industry","figure","street","image","phone","data","practice","window","unit",
  "rock","coach","pressure","response","fish","nature","hair","size","dog","ball",
  "mission","camera","structure","skin","sea","expert","movie","pa","note","task",
  "test","goal","bed","energy","agreement","factor","speech","west","bill","bank"
];

const WORDS_PL = [
  "czas","rok","ludzie","sposob","dzien","mezczyzna","rzecz","kobieta","zycie","dziecko",
  "swiat","szkola","panstwo","rodzina","uczen","grupa","kraj","problem","reka","czesc",
  "miejsce","sprawa","tydzien","firma","system","program","pytanie","praca","rzad","liczba",
  "noc","punkt","dom","woda","pokoj","matka","obszar","pieniadze","historia","fakt",
  "miesiac","duzo","prawo","badanie","ksiazka","oko","zawod","slowo","biznes","kwestia",
  "strona","rodzaj","glowa","usluga","przyjaciel","ojciec","sila","godzina","gra","linia",
  "koniec","czlonek","samochod","miasto","wspolnota","imie","zespol","chwila","pomysl","cialo",
  "informacja","plecy","twarz","poziom","biuro","drzwi","zdrowie","osoba","sztuka","wojna",
  "wynik","zmiana","poranek","powod","nauczyciel","edukacja","stopa","chlopiec","wiek","proces",
  "muzyka","rynek","sens","plan","zainteresowanie","smierc","doswiadczenie","efekt","uzycie","klasa",
  "kontrola","opieka","pole","rola","wysilek","tempo","serce","swiatlo","glos","zona",
  "policja","umysl","cena","raport","decyzja","syn","widok","relacja","droga","roznica",
  "wartosc","budynek","dzialanie","sezon","spoleczenstwo","podatek","pozycja","zawodnik","rekord","kartka",
  "przestrzen","ziemia","forma","wydarzenie","centrum","para","projekt","gwiazda","stol","potrzeba",
  "sad","olej","sytuacja","koszt","przemysl","ulica","obraz","telefon","dane","okno",
  "jednostka","skala","trener","ryba","natura","wlosy","rozmiar","pies","pilka","misja",
  "kamera","skora","morze","ekspert","film","notatka","zadanie","test","cel","lozko",
  "energia","umowa","czynnik","mowa","zachod","rachunek","bank","las","pole","dobry",
  "zly","mily","czysty","latwy","trudny","szybki","wolny","duzy","maly","nowy",
  "stary","bliski","daleki","cieply","zimny","wczesny","pozny","rano","wieczor","jutro",
  "dzisiaj","wczoraj","droga","ogien","ziemia","powietrze","ruch","czasem","zawsze","nigdy"
];

export function generateWords(count: number, lang: Language = "en", minGapSame = 7): string[] {
  const listRaw = lang === "pl" ? WORDS_PL : WORDS_EN;
  const list = Array.from(new Set(listRaw));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let candidate = list[Math.floor(Math.random() * list.length)];
    let attempts = 0;
    while (attempts < 10 && out.slice(Math.max(0, out.length - minGapSame)).includes(candidate)) {
      candidate = list[Math.floor(Math.random() * list.length)];
      attempts++;
    }
    out.push(candidate);
  }
  return out;
}
