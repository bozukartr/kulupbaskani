# Türkiye Kulüp Başkanlığı

> Çalışan prototip hazırdır. Proje framework kullanmadan HTML, CSS ve Vanilla JavaScript ile geliştirilir.

## Mevcut Prototip

- Mobil öncelikli ve safe-area uyumlu arayüz
- Kulüp seçimi ve cihazda otomatik kariyer kaydı
- Ana, Kadro, Transfer, Lig ve Menü ekranları
- Maç simülasyonu, oyuncu rating/form/value güncellemeleri
- Pozisyon filtreleri ve oyuncu detay kartı
- Transfer dönemi, teklif ve kulüp bütçesi akışı
- Dinamik puan durumu
- Sezon başında oluşturulan rastgele çift devreli fikstür
- Lig → takım → oyuncu hiyerarşili manuel admin paneli
- Ayrı lig, takım ve oyuncu veri dosyaları

## Admin Paneli

`admin.html` sayfasından önce ligleri, seçilen ligin altında takımları ve seçilen takımın altında oyuncuları tek tek ekleyebilirsiniz. Takım ekleme veya silme işlemi fikstürü otomatik olarak yeniden oluşturur.

Yerelde çalıştırmak için depo klasöründe basit bir statik sunucu açın:

```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın.

---

Türkiye liglerinde geçen, mobil öncelikli tasarlanmış futbol kulübü yönetim ve transfer simülasyonu.

Oyuncular gerçek veya gerçeğe yakın kulüplerden birini seçer, kadrolarını yönetir, transfer dönemlerinde oyuncu alıp satar ve sezon boyunca maçları simüle eder.

Oyunun ana sistemi; oyuncuların **Overall**, **Form** ve **Value** değerlerinin maç performanslarına göre dinamik biçimde değişmesi üzerine kuruludur.

---

## Proje Amacı

Amaç, klasik ve karmaşık futbol menajerlik oyunlarından daha sade, hızlı ve mobil cihazlara uygun bir futbol yönetim deneyimi oluşturmaktır.

Oyuncu;

* Bir kulüp seçer.
* Mevcut kadroyu yönetir.
* Transfer dönemlerinde oyuncu alır ve satar.
* Maçları simüle eder.
* Oyuncuların performanslarını takip eder.
* Formu yükselen oyuncuların değer kazanmasını izler.
* Kadrosunu sezonlar boyunca geliştirir.
* Lig sıralamasında yükselmeye çalışır.

Stadyum, tesis, taraftar yönetimi, detaylı teknik direktörlük veya çok karmaşık finans sistemleri oyunun ana odağı değildir.

Ana odak:

**Kadro + Transfer + Maç + Oyuncu Gelişimi**

---

# Teknoloji

Proje başlangıçta yalnızca:

* HTML
* CSS
* Vanilla JavaScript

kullanılarak geliştirilecektir.

Framework kullanılmayacaktır.

İlerleyen aşamalarda backend ve kullanıcı sistemi için Firebase kullanılabilir.

Planlanan servisler:

* Firebase Authentication
* Google Sign-In
* Firestore
* Firebase Cloud Functions
* Firebase Hosting
* Firebase Analytics

Mobil uygulamaya dönüştürme aşamasında mevcut web uygulaması Capacitor veya benzeri bir yapı ile paketlenebilir.

---

# Platformlar

Öncelik:

1. Mobil Web
2. Android
3. iOS
4. Desktop Web

UI/UX tasarımı öncelikli olarak telefon ekranlarına göre yapılacaktır.

Desktop görünüm mobil uygulamanın genişletilmiş responsive versiyonu olacaktır.

---

# Tasarım Yaklaşımı

Arayüz mümkün olduğunca minimal tutulmalıdır.

Ana prensip:

> Bir ekranda yalnızca gerçekten gerekli bilgiler gösterilmeli.

Football Manager gibi yoğun menüler kullanılmamalıdır.

Tasarım yaklaşımı:

* Büyük ve okunabilir rakamlar
* Az metin
* Minimal ikon kullanımı
* Düz ve sade kartlar
* Belirgin ana aksiyonlar
* Hızlı ekran geçişleri
* Mobil safe-area desteği
* Büyük dokunma alanları
* Gereksiz modal kullanımından kaçınma
* Responsive tasarım

Genel tasarım hissi:

**SofaScore sadeliği + mobil futbol menajer oyunu**

---

# Ana Navigasyon

Mobil uygulamada maksimum 5 ana sekme olacaktır.

```text
Ana
Kadro
Transfer
Lig
Menü
```

Bottom navigation kullanılacaktır.

Örnek:

```text
┌──────────────────────────┐
│                          │
│      Sayfa İçeriği       │
│                          │
│                          │
├──────────────────────────┤
│ Ana Kadro Transfer Lig ☰ │
└──────────────────────────┘
```

---

# Ana Ekran

Ana ekran oyuncunun kulübünün mevcut durumunu birkaç saniye içerisinde anlamasını sağlamalıdır.

Gösterilecek temel bilgiler:

* Kulüp
* Lig
* Lig sırası
* Transfer bütçesi / kasa
* Sonraki maç
* Son maç formu
* Transfer bildirimleri

Örnek:

```text
FENERBAHÇE            €18.2M
Süper Lig • 2.

SIRADAKİ MAÇ

Fenerbahçe
     VS
Trabzonspor

2 Gün

FORM

W  W  D  L  W

TRANSFER

2 Teklif
1 Bekleyen Yanıt
```

Ana ekranda gereksiz istatistikler gösterilmemelidir.

---

# Kulüpler

Oyunda Türkiye futbol liglerindeki kulüpler bulunabilir.

Planlanan lig kapsamı:

```text
Süper Lig
1. Lig
2. Lig
3. Lig
BAL
```

Her kulüp için minimum veri:

```javascript
{
    id: "club_001",
    name: "Kulüp Adı",
    shortName: "KUL",
    leagueId: "super-lig",
    budget: 15000000,
    logo: "assets/clubs/club_001.png"
}
```

---

# Oyuncular

Oyuncu sistemi özellikle sade tutulacaktır.

Temel oyuncu verisi:

```javascript
{
    id: "player_001",
    name: "Oyuncu Adı",
    position: "ST",
    age: 22,
    clubId: "club_001",

    overall: 74,
    form: 81,
    value: 3500000
}
```

Oyunun temel üç oyuncu değeri:

## Overall

Oyuncunun genel futbol kalitesini temsil eder.

Örnek:

```text
74 OVR
```

Overall kısa sürede çok sık değişmemelidir.

Uzun dönemli performansa göre yükselip düşmelidir.

---

## Form

Oyuncunun mevcut performans seviyesini temsil eder.

Önerilen ölçek:

```text
0 - 100
```

Örnek:

```text
Overall: 74
Form: 89
```

Bu oyuncu mevcut overall seviyesinin üzerinde performans gösterebilir.

Form maçtan maça değişebilir.

---

## Value

Oyuncunun oyun içerisindeki piyasa değeridir.

Örnek:

```text
€3.4M
```

Value dinamik olarak değişir.

Value hesaplanırken kullanılabilecek değişkenler:

* Overall
* Form
* Yaş
* Lig seviyesi

Örnek yaklaşım:

```javascript
value =
    baseOverallValue *
    ageMultiplier *
    formMultiplier *
    leagueMultiplier;
```

---

# Oyuncu Kartı

Ana oyuncu listelerinde minimum bilgi gösterilmelidir.

Örnek:

```text
Ahmet Demir
ST

OVR 74     FORM 82
€3.4M
```

Liste ekranında ekstra bilgi gösterilmemelidir.

Oyuncuya dokunulduğunda detay ekranı açılabilir.

---

# Pozisyonlar

İlk sürümde sade pozisyon sistemi kullanılabilir.

```text
GK
CB
LB
RB

DM
CM
AM

LW
RW
ST
```

İleride ihtiyaç halinde genişletilebilir.

---

# Kadro Ekranı

Kadro ekranında:

* Oyuncu adı
* Pozisyon
* Overall
* Form
* Value

gösterilmelidir.

Örnek:

```text
KADRO

GK

Mert Kaya
OVR 73   FORM 75
€1.4M

DEFANS

Ali Demir
CB
OVR 76   FORM 84
€4.1M

ORTA SAHA

Can Yılmaz
CM
OVR 79   FORM 70
€6.8M
```

Filtreler:

```text
Tümü
GK
DEF
MID
ATT
```

---

# Transfer Sistemi

Transfer sistemi oyunun ana bölümlerinden biridir.

Oyuncular yalnızca aktif transfer dönemlerinde kulüp değiştirebilir.

Planlanan dönemler:

```text
Yaz Transfer Dönemi

Kış Transfer Dönemi
```

Transfer dönemi dışında oyuncular incelenebilir fakat transfer tamamlanamaz.

---

# Transfer Ekranı

Transfer ekranı minimal olacaktır.

Örnek:

```text
TRANSFER

[ Oyuncu ara... ]

ST • 18-25 • Max €5M

Ahmet Kaya
ST

73    88
OVR   FORM

€2.1M
```

Filtreler:

* Pozisyon
* Minimum Overall
* Minimum Form
* Yaş
* Minimum Value
* Maximum Value
* Kulüp
* Lig

Ana ekranda yalnızca önemli filtreler gösterilmelidir.

Detaylı filtreler ayrı panel içerisinde açılabilir.

---

# Transfer Teklifi

İlk sürümde transfer sistemi özellikle basit tutulacaktır.

Teklif:

```text
Oyuncu

Mevcut değer:
€3.2M

Teklif:

€3.500.000

[ Teklif Gönder ]
```

Bilgisayar kontrollü kulüp:

```text
Kabul

Reddet

Karşı Teklif
```

sonuçlarından birini verebilir.

---

# Transfer AI

AI kulüpler kendi ihtiyaçlarına göre oyuncu alıp satabilir.

Örnek ihtiyaç:

```javascript
{
    clubId: "club_010",

    needs: {
        ST: 0.9,
        CB: 0.4,
        CM: 0.2
    }
}
```

AI transfer adaylarını şu kriterlere göre değerlendirebilir:

* Pozisyon ihtiyacı
* Overall
* Form
* Yaş
* Value
* Transfer bütçesi

---

# Maç Sistemi

Maçlar doğrudan oyuncu tarafından oynanmayacaktır.

Bir simülasyon algoritması kullanılacaktır.

Maç motorunun temel amacı:

1. Takım güçlerini hesaplamak
2. Maç sonucunu üretmek
3. Oyuncu performansları üretmek
4. Form değerlerini değiştirmek
5. Uzun vadede overall değerlerini değiştirmek
6. Value değerlerini güncellemek

---

# Oyuncu Maç Gücü

Oyuncunun maç içerisindeki efektif gücü şu şekilde hesaplanabilir:

```javascript
matchPower =
    overall * 0.75 +
    form * 0.25;
```

Örnek:

```text
Overall: 80
Form: 92

Match Power:

83
```

Formu kötü oyuncu:

```text
Overall: 80
Form: 44

Match Power:

71
```

Bu sayede form gerçekten maçları etkiler.

---

# Takım Gücü

İlk 11 oyuncularının güçleri pozisyonlarına göre gruplanabilir.

```javascript
teamStrength = {
    goalkeeper: 76,
    defense: 74,
    midfield: 78,
    attack: 81
};
```

Toplam güç:

```javascript
overallStrength =
    goalkeeper * 0.15 +
    defense * 0.30 +
    midfield * 0.30 +
    attack * 0.25;
```

Bu oranlar geliştirme sürecinde dengelenebilir.

---

# Maç Sonucu Algoritması

Maç sonucunda sadece overall belirleyici olmamalıdır.

Etkenler:

* Takım gücü
* Oyuncu formları
* Ev sahibi avantajı
* Rastgele performans
* Takım hücum gücü
* Takım savunma gücü

Örnek:

```javascript
homePower =
    homeTeamStrength +
    homeAdvantage +
    randomFactor;

awayPower =
    awayTeamStrength +
    randomFactor;
```

Random factor sürpriz sonuçların oluşmasını sağlar.

Örneğin:

```javascript
randomFactor = random(-8, 8);
```

---

# Oyuncu Maç Rating Sistemi

Her maç sonunda oyunculara rating verilir.

Önerilen ölçek:

```text
4.0 - 10.0
```

Rating aşağıdakilerden etkilenebilir:

* Takım sonucu
* Oyuncu overall
* Oyuncu form
* Rakip gücü
* Gol
* Asist
* Pozisyon
* Random performans

Örnek:

```text
Ahmet Demir

2 Gol
1 Asist

Rating

9.1
```

---

# Form Güncelleme

Maç rating'i form değerini etkiler.

Örnek yaklaşım:

```javascript
if (rating >= 8.5) {
    form += 5;
}

else if (rating >= 7.5) {
    form += 3;
}

else if (rating >= 6.5) {
    form += 1;
}

else if (rating < 6.0) {
    form -= 3;
}
```

Form:

```javascript
form = Math.max(0, Math.min(100, form));
```

aralığında tutulmalıdır.

---

# Overall Güncelleme

Overall her maçtan sonra değiştirilmemelidir.

Önerilen yaklaşım:

Oyuncular her:

```text
5 veya 10 maç
```

sonrasında değerlendirilir.

Örnek:

```javascript
if (
    averageRating > 7.5 &&
    age <= 24
) {
    overall += 1;
}
```

Düşüş:

```javascript
if (
    averageRating < 6.2 &&
    age >= 30
) {
    overall -= 1;
}
```

Overall değişimi yavaş ve kontrollü olmalıdır.

---

# Value Güncelleme

Oyuncu değeri daha sık güncellenebilir.

Örnek:

```javascript
function calculatePlayerValue(player) {

    const overallFactor =
        Math.pow(player.overall / 70, 3);

    const formFactor =
        0.8 + player.form / 250;

    const ageFactor =
        getAgeMultiplier(player.age);

    return (
        1000000 *
        overallFactor *
        formFactor *
        ageFactor
    );
}
```

Amaç kesin gerçek piyasa değeri üretmek değil, oyun içinde dengeli bir transfer ekonomisi oluşturmaktır.

---

# Ana Oyun Döngüsü

Oyunun temel gameplay loop'u:

```text
KULÜP

↓

KADRO

↓

MAÇ

↓

PERFORMANS

↓

FORM

↓

OVERALL

↓

VALUE

↓

TRANSFER

↓

YENİ KADRO

↓

MAÇ
```

Bu döngü oyunun ana mekanizmasıdır.

---

# Lig Sistemi

Her lig:

```javascript
{
    id: "super-lig",
    name: "Süper Lig",
    level: 1,
    teams: []
}
```

şeklinde tutulabilir.

Lig sistemi:

* Fikstür
* Puan
* Galibiyet
* Beraberlik
* Mağlubiyet
* Atılan gol
* Yenilen gol
* Averaj

verilerini takip eder.

---

# Puan Durumu

Örnek:

```text
SÜPER LİG

              O  G  B  M  P

1 Galatasaray 20 15 3  2  48
2 Fenerbahçe  20 14 4  2  46
3 Beşiktaş    20 12 4  4  40
```

Mobilde yatay alan mümkün olduğunca verimli kullanılmalıdır.

---

# Sezon Sistemi

Season modeli:

```javascript
{
    id: "2026-2027",

    year: "2026/27",

    currentWeek: 1,

    status: "active"
}
```

Sezon ilerledikçe fikstür otomatik olarak oynatılır.

Sezon sonunda:

* Şampiyon belirlenir.
* Yükselen kulüpler belirlenir.
* Düşen kulüpler belirlenir.
* Yeni sezon oluşturulur.
* Transfer dönemi açılır.

---

# Maç Ekranı

Maç ekranı özellikle sade olacaktır.

Örnek:

```text
67'

FENERBAHÇE      2
TRABZONSPOR     1

23' Ahmet Kaya
58' Mert Demir

41' Can Yılmaz


[ Maçı Hızlandır ]
```

Oyuncunun maç sırasında teknik direktörlük yapması hedeflenmemektedir.

Bu nedenle gereksiz taktik butonları kullanılmayacaktır.

---

# Maç Sonu

Örnek:

```text
MAÇ SONU

FENERBAHÇE 3
TRABZONSPOR 1

En İyi Oyuncu

Ahmet Kaya

Rating 8.9

OVR 76
FORM 84 ↑
VALUE €5.2M ↑
```

Maç sonucunda kullanıcı özellikle oyuncularındaki değer değişimini hissetmelidir.

---

# Veritabanı

İlk prototipte veriler JavaScript dosyalarından veya JSON üzerinden tutulabilir.

Örneğin:

```text
/data

clubs.json
players.json
leagues.json
fixtures.json
```

Firebase entegrasyonu başladığında bu veriler Firestore'a taşınabilir.

---

# Veri Kaynakları

Gerçek futbol verilerinin oyun kodundan bağımsız olması gerekir.

Önerilen yapı:

```text
CSV / Excel
      ↓
Data Importer
      ↓
Game Database
      ↓
Game Engine
```

Başlangıçta veri manuel olarak CSV üzerinden hazırlanabilir.

Örnek:

```text
players.csv

id
name
position
age
club
overall
form
value
```

Bu sayede ileride farklı bir API veya veri sağlayıcıya geçildiğinde oyun motoru değiştirilmez.

---

# Kullanıcı Sistemi

İlk prototip offline olarak geliştirilebilir.

Online sürümde:

```text
Firebase Authentication
```

kullanılabilir.

Giriş seçenekleri:

```text
Google ile devam et

Apple ile devam et
```

Web sürümünde ek olarak email login kullanılabilir.

---

# In-App Purchase

Oyun baştan IAP destekleyebilecek şekilde tasarlanmalıdır.

Ancak gerçek para doğrudan kulüp transfer bütçesine çevrilmemelidir.

Premium para birimi kullanılabilir.

Örnek:

```text
President Coins
```

Kullanım alanları:

* Ek kariyer slotu
* Gelişmiş oyuncu filtreleri
* Scout raporu
* Oyuncu karşılaştırma
* Premium istatistikler
* Reklam kaldırma
* Kozmetik temalar

IAP sistemi oyun motorundan bağımsız tutulmalıdır.

---

# Para Birimleri

İki farklı ekonomik sistem bulunabilir.

## Kulüp Bütçesi

```text
€
```

Transferler için kullanılır.

Oyun içerisinden kazanılır.

## Premium Currency

```text
President Coins
```

IAP ile satın alınabilir.

Kulüp bütçesi ile premium currency birbirinden tamamen ayrı tutulmalıdır.

---

# HUD Prensipleri

HUD üzerinde sürekli gösterilecek bilgiler minimum tutulmalıdır.

Üst HUD:

```text
Kulüp

Lig Sırası

Bütçe
```

Alt HUD:

```text
Ana

Kadro

Transfer

Lig

Menü
```

Ekranların içine mümkün olduğunca fazla bilgi sıkıştırılmamalıdır.

---

# Responsive Tasarım

Ana breakpoint yaklaşımı:

```css
/* Mobile First */

.container {
    width: 100%;
}

/* Tablet */

@media (min-width: 768px) {

}

/* Desktop */

@media (min-width: 1200px) {

}
```

CSS her zaman mobile-first hazırlanmalıdır.

---

# Safe Area

Mobil cihazlarda notch ve gesture alanları hesaba katılmalıdır.

Örnek:

```css
.app {
    padding-top:
        env(safe-area-inset-top);

    padding-bottom:
        env(safe-area-inset-bottom);
}
```

Bottom navigation:

```css
.bottom-nav {
    padding-bottom:
        calc(
            12px +
            env(safe-area-inset-bottom)
        );
}
```

---

# Dokunmatik Kullanım

Touch hedefleri küçük olmamalıdır.

Minimum öneri:

```text
44x44 px
```

Kartların mümkün olduğunca tamamı dokunulabilir olmalıdır.

Sadece küçük ikonlara basılması gereken tasarımlardan kaçınılmalıdır.

---

# Dosya Yapısı

Önerilen başlangıç yapısı:

```text
/
│
├── index.html
│
├── README.md
│
├── favicon.ico
│
├── manifest.json
│
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   │
│   ├── data/
│   │   ├── clubs.js
│   │   ├── players.js
│   │   ├── leagues.js
│   │   └── fixtures.js
│   │
│   ├── engines/
│   │   ├── matchEngine.js
│   │   ├── formEngine.js
│   │   ├── valueEngine.js
│   │   ├── overallEngine.js
│   │   ├── transferEngine.js
│   │   └── seasonEngine.js
│   │
│   ├── services/
│   │   ├── storageService.js
│   │   ├── authService.js
│   │   └── firebaseService.js
│   │
│   ├── ui/
│   │   ├── home.js
│   │   ├── squad.js
│   │   ├── transfers.js
│   │   ├── league.js
│   │   ├── match.js
│   │   └── player.js
│   │
│   └── utils/
│       ├── currency.js
│       ├── random.js
│       └── helpers.js
│
├── data/
│   ├── clubs.json
│   ├── players.json
│   ├── leagues.json
│   └── fixtures.json
│
└── assets/
    ├── icons/
    ├── clubs/
    └── images/
```

---

# Game Engine Ayrımı

UI ile oyun algoritmaları birbirinden ayrılmalıdır.

Yanlış:

```javascript
button.onclick = () => {

    // Maç algoritmasının tamamı

};
```

Doğru:

```javascript
button.onclick = () => {

    const result =
        MatchEngine.simulateMatch(
            homeTeam,
            awayTeam
        );

    MatchUI.render(result);

};
```

Bu yapı oyunun ileride geliştirilmesini çok kolaylaştırır.

---

# Local Storage

İlk prototipte kariyer kayıtları localStorage üzerinde tutulabilir.

Örnek:

```javascript
localStorage.setItem(
    "gameSave",
    JSON.stringify(gameState)
);
```

Firebase entegrasyonundan sonra kayıt sistemi cloud save'e dönüştürülebilir.

---

# Game State

Oyunun merkezi bir state objesi bulunmalıdır.

Örnek:

```javascript
const gameState = {

    user: null,

    selectedClub: null,

    season: null,

    currentWeek: 1,

    transferWindow: false,

    clubs: [],

    players: [],

    fixtures: [],

    standings: []

};
```

UI doğrudan veriyi değiştirmek yerine bu state üzerinden çalışmalıdır.

---

# MVP

İlk oynanabilir sürümde yalnızca aşağıdaki özellikler hedeflenmelidir.

## Faz 1

* HTML/CSS/JS temel yapı
* Mobile-first layout
* Bottom navigation
* Kulüp seçimi
* Ana ekran
* Kadro ekranı
* Oyuncu detay ekranı

## Faz 2

* Oyuncu database
* Kulüp database
* Lig database
* Overall
* Form
* Value
* Oyuncu filtreleme

## Faz 3

* Maç motoru
* Maç sonuçları
* Player rating
* Form güncellemesi
* Value güncellemesi

## Faz 4

* Fikstür
* Lig tablosu
* Haftalar
* Sezon ilerlemesi
* Sezon sonu

## Faz 5

* Transfer ekranı
* Transfer teklifleri
* AI transferleri
* Transfer dönemleri
* Kulüp bütçesi

## Faz 6

* Overall gelişim sistemi
* Yaşa bağlı gelişim/düşüş
* Oyuncu geçmişi
* Sezon istatistikleri

## Faz 7

* Firebase Authentication
* Google Login
* Cloud Save
* Kullanıcı profili

## Faz 8

* In-App Purchase altyapısı
* Premium currency
* Premium özellikler

---

# İlk Sürümde Olmayacaklar

Scope'u korumak amacıyla ilk sürümde:

* Stadyum geliştirme
* Taraftar sistemi
* Tesis geliştirme
* Sponsorluk yönetimi
* Başkanlık seçimleri
* Teknik direktör kariyeri
* Detaylı taktik sistemi
* 3D maç
* Canlı PvP
* Online transfer açık artırması
* Detaylı antrenman sistemi
* Personel yönetimi

bulunmayacaktır.

---

# Ana Oyun Felsefesi

Oyunun en önemli prensibi:

> Basit görünmeli, fakat arkasında yaşayan bir futbol ekonomisi bulunmalı.

Kullanıcı birkaç saniyede ekranı anlayabilmeli.

Ancak arka planda:

```text
Maç
↓
Performans
↓
Form
↓
Overall
↓
Value
↓
Transfer
↓
Yeni Kadrolar
↓
Yeni Maçlar
```

döngüsü sürekli çalışmalıdır.

Oyunun derinliği UI karmaşıklığından değil, bu sistemlerin birbirini etkilemesinden gelmelidir.

---

# Ürün Tanımı

**Türkiye Kulüp Başkanlığı**, Türkiye futbol liglerini kapsayan, transfer ve kadro yönetimi odaklı, mobil-first futbol yönetim oyunudur.

Oyuncular kulüplerini seçer, kadrolarını yönetir ve transfer dönemlerinde oyuncu alıp satar.

Her futbolcunun temel olarak:

```text
Overall
Form
Value
```

değerleri bulunur.

Simüle edilen maçlarda futbolcuların performansları Form değerlerini, uzun vadeli performansları Overall değerlerini ve bunların tamamı piyasa değerlerini etkiler.

Bu değişimler transfer piyasasını ve kulüplerin güç dengelerini sürekli olarak değiştirerek yaşayan bir futbol dünyası oluşturur.
