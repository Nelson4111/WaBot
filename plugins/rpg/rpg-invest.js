import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from './rpg-bank.js'

const FEE_RATE = 0.005
const TICK_MS = 10 * 60 * 1000
const MAX_TICKS = 72

const INSTRUMENTS = {
  AAPL: { name: 'Apple', category: 'Stocks', price: 3500000, volatility: 0.018, risk: 'Medium' },
  TSLA: { name: 'Tesla', category: 'Stocks', price: 4200000, volatility: 0.032, risk: 'High' },
  NVDA: { name: 'Nvidia', category: 'Stocks', price: 6500000, volatility: 0.038, risk: 'High' },
  MSFT: { name: 'Microsoft', category: 'Stocks', price: 5800000, volatility: 0.016, risk: 'Medium' },
  AMZN: { name: 'Amazon', category: 'Stocks', price: 3100000, volatility: 0.024, risk: 'Medium' },
  GOOGL: { name: 'Alphabet', category: 'Stocks', price: 2900000, volatility: 0.021, risk: 'Medium' },
  META: { name: 'Meta', category: 'Stocks', price: 4700000, volatility: 0.029, risk: 'High' },
  JPM: { name: 'JPMorgan', category: 'Stocks', price: 2500000, volatility: 0.017, risk: 'Medium' },
  KO: { name: 'Coca-Cola', category: 'Stocks', price: 950000, volatility: 0.011, risk: 'Low' },
  REIT01: { name: 'City REIT', category: 'REITs', price: 1250000, volatility: 0.016, risk: 'Medium' },
  REIT02: { name: 'Industrial REIT', category: 'REITs', price: 980000, volatility: 0.019, risk: 'Medium' },
  REIT03: { name: 'Residential REIT', category: 'REITs', price: 1100000, volatility: 0.014, risk: 'Low' },
  MMF: { name: 'Money Market Fund', category: 'Money Market', price: 1000000, volatility: 0.001, risk: 'Very Low' },
  TBI: { name: 'Treasury Bill', category: 'Money Market', price: 1000000, volatility: 0.001, risk: 'Very Low' },
  PREF01: { name: 'Preferred Income', category: 'Preferred Stocks', price: 1500000, volatility: 0.010, risk: 'Low' },
  PREF02: { name: 'Preferred Growth', category: 'Preferred Stocks', price: 1800000, volatility: 0.015, risk: 'Medium' },
  BTC: { name: 'Bitcoin', category: 'Crypto', price: 1000000000, volatility: 0.065, risk: 'Very High' },
  ETH: { name: 'Ethereum', category: 'Crypto', price: 55000000, volatility: 0.075, risk: 'Very High' },
  SOL: { name: 'Solana', category: 'Crypto', price: 3500000, volatility: 0.095, risk: 'Very High' },
  BNB: { name: 'BNB', category: 'Crypto', price: 9500000, volatility: 0.070, risk: 'Very High' },
  XRP: { name: 'XRP', category: 'Crypto', price: 9000, volatility: 0.082, risk: 'Very High' },
  ADA: { name: 'Cardano', category: 'Crypto', price: 12000, volatility: 0.088, risk: 'Very High' },
  DOGE: { name: 'Dogecoin', category: 'Crypto', price: 2500, volatility: 0.105, risk: 'Extreme' },
  AVAX: { name: 'Avalanche', category: 'Crypto', price: 650000, volatility: 0.092, risk: 'Very High' },
  DOT: { name: 'Polkadot', category: 'Crypto', price: 125000, volatility: 0.086, risk: 'Very High' },
  LINK: { name: 'Chainlink', category: 'Crypto', price: 280000, volatility: 0.090, risk: 'Very High' },
  LTC: { name: 'Litecoin', category: 'Crypto', price: 1400000, volatility: 0.068, risk: 'High' },
  USDIDR: { name: 'USD/IDR', category: 'Forex', price: 15800, volatility: 0.004, risk: 'Low' },
  EURUSD: { name: 'EUR/USD', category: 'Forex', price: 17000, volatility: 0.003, risk: 'Low' },
  GBPUSD: { name: 'GBP/USD', category: 'Forex', price: 19900, volatility: 0.005, risk: 'Medium' },
  USDJPY: { name: 'USD/JPY', category: 'Forex', price: 10500, volatility: 0.004, risk: 'Low' },
  USDCHF: { name: 'USD/CHF', category: 'Forex', price: 17800, volatility: 0.004, risk: 'Low' },
  AUDUSD: { name: 'AUD/USD', category: 'Forex', price: 10400, volatility: 0.005, risk: 'Medium' },
  USDCAD: { name: 'USD/CAD', category: 'Forex', price: 11600, volatility: 0.004, risk: 'Low' },
  NZDUSD: { name: 'NZD/USD', category: 'Forex', price: 9800, volatility: 0.005, risk: 'Medium' },
  EURGBP: { name: 'EUR/GBP', category: 'Forex', price: 21300, volatility: 0.004, risk: 'Low' },
  EURJPY: { name: 'EUR/JPY', category: 'Forex', price: 18200, volatility: 0.005, risk: 'Medium' },
  GBPJPY: { name: 'GBP/JPY', category: 'Forex', price: 23100, volatility: 0.007, risk: 'High' },
  GOLD: { name: 'Gold', category: 'Commodities', price: 1200000, volatility: 0.012, risk: 'Low' },
  SILVER: { name: 'Silver', category: 'Commodities', price: 18000, volatility: 0.022, risk: 'Medium' },
  PLATINUM: { name: 'Platinum', category: 'Commodities', price: 850000, volatility: 0.020, risk: 'Medium' },
  PALLADIUM: { name: 'Palladium', category: 'Commodities', price: 1200000, volatility: 0.032, risk: 'High' },
  OIL: { name: 'Oil', category: 'Commodities', price: 1100000, volatility: 0.028, risk: 'High' },
  GAS: { name: 'Natural Gas', category: 'Commodities', price: 950000, volatility: 0.045, risk: 'High' },
  COPPER: { name: 'Copper', category: 'Commodities', price: 180000, volatility: 0.021, risk: 'Medium' },
  NICKEL: { name: 'Nickel', category: 'Commodities', price: 290000, volatility: 0.030, risk: 'High' },
  ALUMINUM: { name: 'Aluminum', category: 'Commodities', price: 42000, volatility: 0.018, risk: 'Medium' },
  ZINC: { name: 'Zinc', category: 'Commodities', price: 46000, volatility: 0.022, risk: 'Medium' },
  IRONORE: { name: 'Iron Ore', category: 'Commodities', price: 175000, volatility: 0.027, risk: 'High' },
  WHEAT: { name: 'Wheat', category: 'Commodities', price: 145000, volatility: 0.019, risk: 'Medium' },
  CORN: { name: 'Corn', category: 'Commodities', price: 95000, volatility: 0.021, risk: 'Medium' },
  RICE: { name: 'Rice', category: 'Commodities', price: 72000, volatility: 0.017, risk: 'Low' },
  COFFEE: { name: 'Coffee', category: 'Commodities', price: 190000, volatility: 0.026, risk: 'Medium' },
  COCOA: { name: 'Cocoa', category: 'Commodities', price: 260000, volatility: 0.034, risk: 'High' },
  SUGAR: { name: 'Sugar', category: 'Commodities', price: 85000, volatility: 0.018, risk: 'Medium' },
  COTTON: { name: 'Cotton', category: 'Commodities', price: 105000, volatility: 0.023, risk: 'Medium' },
  SOYBEAN: { name: 'Soybean', category: 'Commodities', price: 130000, volatility: 0.022, risk: 'Medium' },
  ORANGEJUICE: { name: 'Orange Juice', category: 'Commodities', price: 155000, volatility: 0.038, risk: 'High' },
  SP500: { name: 'S&P 500', category: 'Indices', price: 5800000, volatility: 0.012, risk: 'Medium' },
  NASDAQ: { name: 'Nasdaq', category: 'Indices', price: 7200000, volatility: 0.022, risk: 'Medium' },
  DOW: { name: 'Dow Jones', category: 'Indices', price: 6100000, volatility: 0.011, risk: 'Low' },
  FTSE100: { name: 'FTSE 100', category: 'Indices', price: 4300000, volatility: 0.013, risk: 'Medium' },
  DAX: { name: 'DAX', category: 'Indices', price: 5200000, volatility: 0.017, risk: 'Medium' },
  CAC40: { name: 'CAC 40', category: 'Indices', price: 3900000, volatility: 0.014, risk: 'Medium' },
  NIKKEI225: { name: 'Nikkei 225', category: 'Indices', price: 4700000, volatility: 0.016, risk: 'Medium' },
  HANGSENG: { name: 'Hang Seng', category: 'Indices', price: 2600000, volatility: 0.025, risk: 'High' },
  KOSPI: { name: 'KOSPI', category: 'Indices', price: 1800000, volatility: 0.018, risk: 'Medium' },
  ASX200: { name: 'ASX 200', category: 'Indices', price: 3100000, volatility: 0.014, risk: 'Medium' },
  IHSG: { name: 'IDX Composite / IHSG', category: 'Indices', price: 1250000, volatility: 0.020, risk: 'Medium' },
  GOVBOND: { name: 'Government Bond', category: 'Bonds', price: 1000000, volatility: 0.002, risk: 'Low' },
  CORPBOND: { name: 'Corporate Bond', category: 'Bonds', price: 1000000, volatility: 0.006, risk: 'Medium' },
  HIGHYIELDBOND: { name: 'High-Yield Bond', category: 'Bonds', price: 1000000, volatility: 0.012, risk: 'High' },
  MUNICIPALBOND: { name: 'Municipal Bond', category: 'Bonds', price: 1000000, volatility: 0.004, risk: 'Low' },
  WORLD: { name: 'World ETF', category: 'ETFs', price: 2500000, volatility: 0.014, risk: 'Medium' },
  TECHETF: { name: 'Tech ETF', category: 'ETFs', price: 3800000, volatility: 0.025, risk: 'Medium' },
  GOLDETF: { name: 'Gold ETF', category: 'ETFs', price: 1500000, volatility: 0.010, risk: 'Low' },
  SP500ETF: { name: 'S&P 500 ETF', category: 'ETFs', price: 2900000, volatility: 0.012, risk: 'Medium' },
  DIVIDENDETF: { name: 'Dividend ETF', category: 'ETFs', price: 2200000, volatility: 0.011, risk: 'Low' },
  BONDETF: { name: 'Bond ETF', category: 'ETFs', price: 1750000, volatility: 0.006, risk: 'Low' },
  EMERGINGETF: { name: 'Emerging Market ETF', category: 'ETFs', price: 1900000, volatility: 0.021, risk: 'High' },
  CRYPTOETF: { name: 'Crypto ETF', category: 'ETFs', price: 2700000, volatility: 0.055, risk: 'Very High' },
  OILFUT: { name: 'Oil Futures', category: 'Futures', price: 1400000, volatility: 0.055, risk: 'Very High' },
  BTCFUT: { name: 'Bitcoin Futures', category: 'Futures', price: 980000000, volatility: 0.080, risk: 'Extreme' },
  GOLDOPT: { name: 'Gold Options', category: 'Options', price: 120000, volatility: 0.090, risk: 'Extreme' },
  BTCOPT: { name: 'Bitcoin Options', category: 'Options', price: 8500000, volatility: 0.110, risk: 'Extreme' },
  TECHWARRANT: { name: 'Tech Warrant', category: 'Warrants', price: 250000, volatility: 0.090, risk: 'Extreme' },
  INDEXWARRANT: { name: 'Index Warrant', category: 'Warrants', price: 180000, volatility: 0.075, risk: 'Very High' },
  BTCUSD: { name: 'BTC CFD', category: 'CFD', price: 1000000000, volatility: 0.090, risk: 'Extreme' },
  SP500CFD: { name: 'S&P 500 CFD', category: 'CFD', price: 5800000, volatility: 0.035, risk: 'Very High' },
  BTCPERP: { name: 'Bitcoin Perpetual Futures', category: 'Perpetual Futures', price: 1000000000, volatility: 0.095, risk: 'Extreme' },
  ETHPERP: { name: 'Ethereum Perpetual Futures', category: 'Perpetual Futures', price: 55000000, volatility: 0.105, risk: 'Extreme' },
  GOLD_SWAP: { name: 'Gold Swap', category: 'Swaps', price: 1200000, volatility: 0.018, risk: 'High' },
  RATE_SWAP: { name: 'Interest Rate Swap', category: 'Swaps', price: 1000000, volatility: 0.010, risk: 'High' }
}

const NEWS_POOL = [
  { text: 'Sentimen teknologi menguat setelah laporan pendapatan positif.', impact: { Stocks: 0.012, Indices: 0.008, ETFs: 0.010 } },
  { text: 'Investor mengurangi risiko dan berpindah ke aset defensif.', impact: { Crypto: -0.020, Stocks: -0.010, Bonds: 0.008, Money_Market: 0.006 } },
  { text: 'Permintaan energi meningkat dan mendorong harga komoditas.', impact: { OIL: 0.030, GAS: 0.025, Commodities: 0.012 } },
  { text: 'Produksi logam bertambah sehingga komoditas logam tertekan.', impact: { GOLD: -0.015, SILVER: -0.020, COPPER: -0.018, PLATINUM: -0.017, PALLADIUM: -0.022, NICKEL: -0.020, ALUMINUM: -0.015, ZINC: -0.018, IRONORE: -0.021 } },
  { text: 'Data ekonomi global melemah, indeks bergerak turun.', impact: { Indices: -0.018, Stocks: -0.012, Forex: 0.004 } },
  { text: 'Arus dana masuk ke aset digital memicu reli crypto.', impact: { Crypto: 0.035, BTC: 0.025, ETH: 0.020 } },
  { text: 'Pasar bergerak hati-hati dalam rentang sideways.', impact: { all: 0 } },
  { text: 'Gangguan pasokan pangan meningkatkan harga soft commodities.', impact: { WHEAT: 0.028, COFFEE: 0.022, COCOA: 0.030, SUGAR: 0.015, CORN: 0.020, RICE: 0.018, SOYBEAN: 0.024, COTTON: 0.016, ORANGEJUICE: 0.022 } },
  { text: 'Bank sentral mempertahankan suku bunga sehingga pasar bergerak stabil.', impact: { Forex: 0.005, Bonds: 0.006, Money_Market: 0.004 } },
  { text: 'Ekspektasi penurunan suku bunga meningkatkan minat terhadap saham.', impact: { Stocks: 0.018, Indices: 0.015, ETFs: 0.014, Bonds: 0.012, REITs: 0.016 } },
  { text: 'Kenaikan suku bunga menekan aset berisiko dan sektor properti.', impact: { Stocks: -0.015, Indices: -0.012, REITs: -0.022, Bonds: -0.010, ETFs: -0.012 } },
  { text: 'Dolar AS menguat terhadap mata uang utama setelah data ekonomi kuat.', impact: { USDIDR: 0.018, EURUSD: -0.014, GBPUSD: -0.016, AUDUSD: -0.012, NZDUSD: -0.012, EURGBP: 0.004, USDJPY: 0.012, USDCHF: 0.010, USDCAD: 0.008 } },
  { text: 'Dolar AS melemah setelah laporan ekonomi mengecewakan.', impact: { USDIDR: -0.016, EURUSD: 0.014, GBPUSD: 0.016, AUDUSD: 0.013, NZDUSD: 0.012, USDJPY: -0.014, USDCHF: -0.010, USDCAD: -0.008 } },
  { text: 'Ketegangan geopolitik meningkatkan permintaan aset safe haven.', impact: { GOLD: 0.028, SILVER: 0.018, USDCHF: 0.012, Bonds: 0.015, Stocks: -0.014, Crypto: -0.010 } },
  { text: 'Situasi geopolitik mereda dan investor kembali mengambil risiko.', impact: { Stocks: 0.014, Indices: 0.012, Crypto: 0.018, Gold: -0.015, Bonds: -0.010 } },
  { text: 'Inflasi meningkat lebih tinggi dari perkiraan dan menekan pasar saham.', impact: { Stocks: -0.018, Indices: -0.016, Bonds: -0.014, REITs: -0.017, Gold: 0.012 } },
  { text: 'Inflasi mulai melandai sehingga sentimen pasar membaik.', impact: { Stocks: 0.016, Indices: 0.014, Bonds: 0.012, REITs: 0.015, ETFs: 0.013 } },
  { text: 'Data lapangan kerja yang kuat meningkatkan optimisme ekonomi.', impact: { Stocks: 0.015, Indices: 0.013, USDIDR: 0.008, USDJPY: 0.009, GBPUSD: -0.006 } },
  { text: 'Data tenaga kerja melemah dan memicu kekhawatiran perlambatan ekonomi.', impact: { Stocks: -0.016, Indices: -0.014, USDIDR: -0.007, Bonds: 0.010 } },
  { text: 'Sektor teknologi memimpin kenaikan pasar setelah prospek AI meningkat.', impact: { NVDA: 0.035, MSFT: 0.022, GOOGL: 0.024, META: 0.020, NASDAQ: 0.028, TECHETF: 0.030, TECHWARRANT: 0.045 } },
  { text: 'Permintaan chip global meningkat dan mengangkat saham semikonduktor.', impact: { NVDA: 0.040, Stocks: 0.012, NASDAQ: 0.020, TECHETF: 0.025 } },
  { text: 'Penjualan kendaraan listrik meningkat dan mendukung saham otomotif.', impact: { TSLA: 0.032, Stocks: 0.010, Indices: 0.006 } },
  { text: 'Persaingan kendaraan listrik semakin ketat dan menekan saham otomotif.', impact: { TSLA: -0.028, Stocks: -0.008 } },
  { text: 'Belanja konsumen meningkat dan menguntungkan perusahaan ritel.', impact: { AMZN: 0.024, KO: 0.012, Stocks: 0.010 } },
  { text: 'Penurunan belanja konsumen menekan sektor ritel.', impact: { AMZN: -0.022, KO: -0.010, Stocks: -0.009 } },
  { text: 'Sektor perbankan mendapat sentimen positif dari pertumbuhan kredit.', impact: { JPM: 0.025, Stocks: 0.009, Indices: 0.006 } },
  { text: 'Kekhawatiran kualitas kredit menekan saham sektor perbankan.', impact: { JPM: -0.028, Stocks: -0.010, Indices: -0.008 } },
  { text: 'Laporan pendapatan Apple melampaui ekspektasi pasar.', impact: { AAPL: 0.032, Stocks: 0.008, NASDAQ: 0.012, TECHETF: 0.015 } },
  { text: 'Prospek pendapatan Apple melemah setelah permintaan produk menurun.', impact: { AAPL: -0.028, Stocks: -0.008, NASDAQ: -0.010 } },
  { text: 'Laporan pendapatan Tesla mengecewakan investor.', impact: { TSLA: -0.035, Stocks: -0.008, NASDAQ: -0.012 } },
  { text: 'Pertumbuhan layanan cloud dan AI mengangkat saham Microsoft.', impact: { MSFT: 0.028, Stocks: 0.008, NASDAQ: 0.012, TECHETF: 0.014 } },
  { text: 'Regulasi teknologi baru meningkatkan ketidakpastian sektor digital.', impact: { GOOGL: -0.020, META: -0.018, NASDAQ: -0.015, TECHETF: -0.017 } },
  { text: 'Aktivitas periklanan digital meningkat dan mendukung perusahaan teknologi.', impact: { GOOGL: 0.020, META: 0.025, TECHETF: 0.018 } },
  { text: 'Arus modal asing masuk ke pasar saham global.', impact: { Stocks: 0.014, Indices: 0.012, ETFs: 0.013, REITs: 0.010 } },
  { text: 'Investor global menarik dana dari aset berisiko.', impact: { Stocks: -0.016, Indices: -0.014, ETFs: -0.015, REITs: -0.012, Crypto: -0.022 } },
  { text: 'Pasar Amerika menguat setelah data ekonomi menunjukkan pertumbuhan solid.', impact: { SP500: 0.018, NASDAQ: 0.020, DOW: 0.014, Stocks: 0.012 } },
  { text: 'Kekhawatiran resesi menekan indeks saham Amerika.', impact: { SP500: -0.020, NASDAQ: -0.022, DOW: -0.018, Stocks: -0.015 } },
  { text: 'Investor Jepang meningkatkan minat terhadap pasar saham domestik.', impact: { NIKKEI225: 0.025, JPY: 0.008, Stocks: 0.006 } },
  { text: 'Pasar Asia melemah akibat kekhawatiran pertumbuhan ekonomi regional.', impact: { HANGSENG: -0.024, KOSPI: -0.018, NIKKEI225: -0.012, ASX200: -0.010 } },
  { text: 'Sektor manufaktur Jerman membaik dan mengangkat pasar Eropa.', impact: { DAX: 0.022, EURUSD: 0.010, EURGBP: 0.008 } },
  { text: 'Data ekonomi Inggris membaik dan mendukung pasar saham Inggris.', impact: { FTSE100: 0.018, GBPUSD: 0.012, GBPJPY: 0.014 } },
  { text: 'Pasar Prancis menguat setelah indikator ekonomi menunjukkan pemulihan.', impact: { CAC40: 0.020, EURUSD: 0.008 } },
  { text: 'Investor Indonesia meningkatkan minat terhadap saham domestik.', impact: { IHSG: 0.025, Stocks: 0.008, USDIDR: -0.006 } },
  { text: 'Arus keluar modal asing menekan indeks saham Indonesia.', impact: { IHSG: -0.025, Stocks: -0.008, USDIDR: 0.010 } },
  { text: 'Harga minyak melonjak setelah gangguan pasokan global.', impact: { OIL: 0.045, GAS: 0.025, Commodities: 0.018 } },
  { text: 'Produksi minyak global meningkat dan menekan harga energi.', impact: { OIL: -0.038, GAS: -0.025 } },
  { text: 'Cuaca ekstrem mengganggu produksi gas alam.', impact: { GAS: 0.050, OIL: 0.018 } },
  { text: 'Cadangan gas alam meningkat lebih tinggi dari perkiraan.', impact: { GAS: -0.045 } },
  { text: 'Permintaan tembaga meningkat akibat ekspansi industri.', impact: { COPPER: 0.032, NICKEL: 0.022, ALUMINUM: 0.020, ZINC: 0.018 } },
  { text: 'Perlambatan sektor manufaktur menekan permintaan logam industri.', impact: { COPPER: -0.028, NICKEL: -0.030, ALUMINUM: -0.022, ZINC: -0.025, IRONORE: -0.028 } },
  { text: 'Kebutuhan baja meningkat seiring pembangunan infrastruktur.', impact: { IRONORE: 0.035, NICKEL: 0.018, COPPER: 0.015 } },
  { text: 'Gangguan tambang mengurangi pasokan nikel dunia.', impact: { NICKEL: 0.040 } },
  { text: 'Produksi aluminium meningkat dan menekan harga logam.', impact: { ALUMINUM: -0.030 } },
  { text: 'Permintaan seng meningkat dari sektor konstruksi.', impact: { ZINC: 0.030 } },
  { text: 'Ketidakpastian ekonomi meningkatkan minat investor terhadap emas.', impact: { GOLD: 0.030, SILVER: 0.020, Stocks: -0.008 } },
  { text: 'Penguatan dolar dan kenaikan imbal hasil obligasi menekan harga emas.', impact: { GOLD: -0.025, SILVER: -0.018 } },
  { text: 'Permintaan industri platinum meningkat.', impact: { PLATINUM: 0.032, PALLADIUM: 0.018 } },
  { text: 'Penurunan permintaan otomotif menekan pasar palladium.', impact: { PALLADIUM: -0.038 } },
  { text: 'Cuaca buruk mengganggu produksi gandum dan meningkatkan harga pangan.', impact: { WHEAT: 0.040, CORN: 0.022, SOYBEAN: 0.018 } },
  { text: 'Panen jagung melimpah meningkatkan pasokan global.', impact: { CORN: -0.032 } },
  { text: 'Produksi kopi terganggu oleh cuaca buruk.', impact: { COFFEE: 0.038 } },
  { text: 'Panen kopi global meningkat dan menekan harga.', impact: { COFFEE: -0.030 } },
  { text: 'Gangguan produksi kakao menyebabkan harga melonjak.', impact: { COCOA: 0.050 } },
  { text: 'Pasokan kakao pulih sehingga harga mulai turun.', impact: { COCOA: -0.040 } },
  { text: 'Produksi gula meningkat setelah musim panen yang kuat.', impact: { SUGAR: -0.025 } },
  { text: 'Cuaca buruk mengganggu perkebunan kapas.', impact: { COTTON: 0.035 } },
  { text: 'Pasokan kedelai meningkat setelah hasil panen melebihi perkiraan.', impact: { SOYBEAN: -0.030 } },
  { text: 'Badai besar mengganggu produksi jeruk dan mendorong harga Orange Juice.', impact: { ORANGEJUICE: 0.055 } },
  { text: 'Pasar properti komersial menunjukkan pemulihan.', impact: { REITs: 0.025, Stocks: 0.008 } },
  { text: 'Kekhawatiran sektor properti menekan harga REIT.', impact: { REITs: -0.028 } },
  { text: 'Tingkat hunian properti residensial meningkat.', impact: { REIT03: 0.028, REITs: 0.012 } },
  { text: 'Permintaan gudang dan pusat distribusi meningkat.', impact: { REIT02: 0.030, REITs: 0.014 } },
  { text: 'Pendapatan sewa pusat kota meningkat dan mendukung City REIT.', impact: { REIT01: 0.028, REITs: 0.012 } },
  { text: 'Investor meningkatkan dana pada instrumen pasar uang karena ketidakpastian.', impact: { Money_Market: 0.008, Bonds: 0.006, Stocks: -0.008 } },
  { text: 'Ekspektasi suku bunga turun meningkatkan minat terhadap obligasi pemerintah.', impact: { GOVBOND: 0.018, Bonds: 0.012, Money_Market: -0.004 } },
  { text: 'Risiko kredit meningkat dan menekan obligasi korporasi.', impact: { CORPBOND: -0.018, HIGHYIELDBOND: -0.030, Bonds: -0.012 } },
  { text: 'Investor mencari imbal hasil lebih tinggi di tengah pasar yang stabil.', impact: { HIGHYIELDBOND: 0.022, CORPBOND: 0.014 } },
  { text: 'Kualitas kredit perusahaan membaik dan mendukung corporate bonds.', impact: { CORPBOND: 0.020, HIGHYIELDBOND: 0.025 } },
  { text: 'Investor beralih ke ETF global untuk diversifikasi portfolio.', impact: { WORLD: 0.018, ETFs: 0.012 } },
  { text: 'Sektor teknologi kembali menjadi pilihan utama investor ETF.', impact: { TECHETF: 0.028, NASDAQ: 0.020, ETFs: 0.012 } },
  { text: 'Permintaan ETF berbasis dividen meningkat saat pasar bergejolak.', impact: { DIVIDENDETF: 0.020, ETFs: 0.010, Stocks: -0.006 } },
  { text: 'Investor meningkatkan eksposur terhadap pasar berkembang.', impact: { EMERGINGETF: 0.030 } },
  { text: 'Penurunan pasar crypto menekan produk investasi berbasis aset digital.', impact: { CRYPTOETF: -0.040, Crypto: -0.030 } },
  { text: 'Arus dana institusional masuk ke ETF crypto.', impact: { CRYPTOETF: 0.045, Crypto: 0.032, BTC: 0.040 } },
  { text: 'Pasar crypto memasuki fase bullish setelah volume perdagangan meningkat.', impact: { Crypto: 0.045, BTC: 0.055, ETH: 0.048, SOL: 0.050, BNB: 0.040 } },
  { text: 'Tekanan jual besar membuat pasar crypto terkoreksi.', impact: { Crypto: -0.050, BTC: -0.060, ETH: -0.055, SOL: -0.065, BNB: -0.045 } },
  { text: 'Adopsi Bitcoin oleh institusi besar meningkatkan kepercayaan pasar.', impact: { BTC: 0.060, CRYPTOETF: 0.040, Crypto: 0.035 } },
  { text: 'Aktivitas jaringan Ethereum meningkat setelah perkembangan ekosistem baru.', impact: { ETH: 0.050, CRYPTOETF: 0.020, Crypto: 0.025 } },
  { text: 'Aktivitas jaringan Solana melonjak dan menarik minat trader.', impact: { SOL: 0.065, Crypto: 0.025 } },
  { text: 'Sentimen negatif terhadap meme coin meningkatkan volatilitas Dogecoin.', impact: { DOGE: -0.055, Crypto: -0.012 } },
  { text: 'Minat spekulatif meningkat dan mendorong Dogecoin naik tajam.', impact: { DOGE: 0.075, Crypto: 0.018 } },
  { text: 'Regulasi crypto baru meningkatkan ketidakpastian investor.', impact: { Crypto: -0.035, BTC: -0.040, ETH: -0.038, CRYPTOETF: -0.030 } },
  { text: 'Regulasi aset digital menjadi lebih jelas dan meningkatkan kepercayaan pasar.', impact: { Crypto: 0.032, BTC: 0.040, ETH: 0.035, CRYPTOETF: 0.028 } },
  { text: 'Volume perdagangan crypto menurun dan pasar bergerak sideways.', impact: { Crypto: -0.005, BTC: 0.002, ETH: 0.001 } },
  { text: 'Permintaan BNB meningkat setelah aktivitas ekosistem exchange menguat.', impact: { BNB: 0.045, Crypto: 0.018 } },
  { text: 'Aktivitas jaringan XRP meningkat dan mendorong minat pasar.', impact: { XRP: 0.045, Crypto: 0.015 } },
  { text: 'Minat terhadap proyek blockchain alternatif meningkat.', impact: { ADA: 0.040, AVAX: 0.045, DOT: 0.038, LINK: 0.042, LTC: 0.025, Crypto: 0.020 } },
  { text: 'Koreksi altcoin terjadi setelah trader mengambil keuntungan.', impact: { ADA: -0.045, AVAX: -0.050, DOT: -0.042, LINK: -0.045, LTC: -0.030, Crypto: -0.025 } },
  { text: 'Volatilitas Bitcoin meningkat menjelang keputusan besar pasar.', impact: { BTC: 0.020, BTCFUT: 0.035, BTCOPT: 0.045, BTCPERP: 0.050 } },
  { text: 'Aktivitas trading derivatif meningkat di tengah volatilitas tinggi.', impact: { Futures: 0.025, Options: 0.030, 'Perpetual Futures': 0.040, Warrants: 0.030, CFD: 0.025 } },
  { text: 'Volatilitas pasar menurun dan aktivitas derivatif mulai stabil.', impact: { Futures: -0.012, Options: -0.018, 'Perpetual Futures': -0.020, Warrants: -0.015, CFD: -0.012 } },
  { text: 'Harga minyak melonjak sehingga kontrak futures energi ikut menguat.', impact: { OIL: 0.035, OILFUT: 0.055, Futures: 0.025 } },
  { text: 'Penurunan tajam Bitcoin meningkatkan risiko pada kontrak perpetual.', impact: { BTC: -0.045, BTCPERP: -0.075, ETHPERP: -0.060, 'Perpetual Futures': -0.040 } },
  { text: 'Kenaikan harga emas meningkatkan minat terhadap Gold Options.', impact: { GOLD: 0.025, GOLDOPT: 0.045, Options: 0.020 } },
  { text: 'Volatilitas teknologi meningkatkan nilai instrumen warrant sektor tech.', impact: { TECHETF: 0.018, TECHWARRANT: 0.050, Warrants: 0.025 } },
  { text: 'Pasar saham yang volatil meningkatkan aktivitas CFD indeks.', impact: { SP500: 0.012, SP500CFD: 0.030, CFD: 0.022 } },
  { text: 'Perubahan ekspektasi suku bunga meningkatkan aktivitas interest rate swap.', impact: { RATE_SWAP: 0.035, Swaps: 0.020, Bonds: -0.008 } },
  { text: 'Pergerakan harga emas meningkatkan aktivitas commodity swap.', impact: { GOLD: 0.018, GOLD_SWAP: 0.032, Swaps: 0.018 } },
  { text: 'Pasar global memasuki fase risk-on dan investor kembali membeli aset berisiko.', impact: { Stocks: 0.018, Crypto: 0.030, Indices: 0.016, ETFs: 0.017, REITs: 0.014 } },
  { text: 'Pasar global memasuki fase risk-off dan investor mencari aset defensif.', impact: { Stocks: -0.020, Crypto: -0.035, Indices: -0.018, Bonds: 0.018, GOLD: 0.022, Money_Market: 0.010 } },
  { text: 'Volume perdagangan global meningkat dan volatilitas market ikut naik.', impact: { Stocks: 0.010, Crypto: 0.025, Forex: 0.012, Commodities: 0.015, Futures: 0.030, Options: 0.035 } },
  { text: 'Likuiditas pasar meningkat dan spread perdagangan semakin ketat.', impact: { Stocks: 0.006, Crypto: 0.010, Forex: 0.006, ETFs: 0.008 } },
  { text: 'Investor melakukan aksi ambil untung setelah reli panjang.', impact: { Stocks: -0.012, Crypto: -0.025, Indices: -0.010, ETFs: -0.012 } },
  { text: 'Sentimen investor membaik setelah pasar mengalami koreksi.', impact: { Stocks: 0.015, Crypto: 0.022, Indices: 0.013, ETFs: 0.014 } },
  { text: 'Kekhawatiran likuiditas membuat investor menjual aset berisiko.', impact: { Stocks: -0.022, Crypto: -0.040, REITs: -0.020, ETFs: -0.018, Futures: -0.025 } },
  { text: 'Pemulihan ekonomi global meningkatkan permintaan aset siklikal.', impact: { Stocks: 0.020, Indices: 0.018, COPPER: 0.025, OIL: 0.022, IRONORE: 0.020 } },
  { text: 'Perlambatan ekonomi global menekan permintaan komoditas industri.', impact: { OIL: -0.025, COPPER: -0.022, NICKEL: -0.025, ALUMINUM: -0.020, IRONORE: -0.024 } },
  { text: 'Pasar obligasi stabil setelah investor menunggu keputusan bank sentral.', impact: { Bonds: 0.004, GOVBOND: 0.006, CORPBOND: 0.004 } },
  { text: 'Pasar valuta asing bergerak tenang setelah volatilitas menurun.', impact: { Forex: 0.002 } },
  { text: 'Ketidakpastian global meningkat dan mendorong volatilitas seluruh market.', impact: { Stocks: -0.018, Crypto: -0.030, Forex: 0.012, Commodities: 0.015, Indices: -0.016, ETFs: -0.018 } },
  { text: 'Sentimen pasar global membaik dan hampir seluruh aset mengalami penguatan.', impact: { Stocks: 0.015, Crypto: 0.025, Forex: 0.006, Commodities: 0.012, Indices: 0.014, ETFs: 0.015, REITs: 0.012 } },
  { text: 'Pasar memasuki kondisi netral tanpa katalis besar.', impact: { all: 0 } }
]

const MARKET_NAMES = {
  bull: 'Bull Market', bear: 'Bear Market', crash: 'Market Crash',
  recovery: 'Market Recovery', sideways: 'Sideways', run: 'Bull Run'
}

const money = value => `Rp ${Math.round(value).toLocaleString('id-ID')}`
const number = value => Number(value).toLocaleString('id-ID', { maximumFractionDigits: 6 })
const signedMoney = value => `${value >= 0 ? '+' : '-'}${money(Math.abs(value))}`
const line = '─'.repeat(28)
const title = text => `╭─「 ${text} 」─╮`
const footer = () => `╰${line}╯`

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const random = (min, max) => min + Math.random() * (max - min)

function ensureMarket(db) {
  const root = global.db.data
  if (!root.invest) {
    root.invest = { prices: {}, history: {}, regime: 'sideways', updatedAt: Date.now(), news: [], sequence: 0 }
  }
  const market = root.invest
  for (const [symbol, item] of Object.entries(INSTRUMENTS)) {
    if (!Number.isFinite(market.prices[symbol])) market.prices[symbol] = item.price
    if (!Array.isArray(market.history[symbol])) market.history[symbol] = [market.prices[symbol]]
  }
  return market
}

function getNewsImpact(news, symbol, item) {
  const impact = news?.impact || {}
  return impact[symbol] || impact[item.category] || impact.all || 0
}

function chooseRegime() {
  const roll = Math.random()
  if (roll < 0.08) return 'crash'
  if (roll < 0.20) return 'bear'
  if (roll < 0.42) return 'sideways'
  if (roll < 0.65) return 'bull'
  if (roll < 0.76) return 'recovery'
  return 'run'
}

function regimeBias(regime, item) {
  if (regime === 'crash') return item.category === 'Bonds' ? 0.012 : -0.045
  if (regime === 'bear') return item.category === 'Bonds' ? 0.006 : -0.012
  if (regime === 'bull') return item.category === 'Bonds' ? -0.002 : 0.010
  if (regime === 'run') return item.category === 'Crypto' ? 0.045 : 0.018
  if (regime === 'recovery') return 0.014
  return 0
}

function tickMarket(market) {
  const now = Date.now()
  const elapsed = now - (market.updatedAt || now)
  const ticks = clamp(Math.floor(elapsed / TICK_MS), 0, MAX_TICKS)
  if (ticks < 1) return false

  for (let tick = 0; tick < ticks; tick++) {
    if (Math.random() < 0.14) market.regime = chooseRegime()
    const news = Math.random() < 0.22 ? NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)] : null
    if (news) market.news.unshift({ text: news.text, at: now - (ticks - tick) * TICK_MS, impact: news.impact })

    for (const [symbol, item] of Object.entries(INSTRUMENTS)) {
      const oldPrice = market.prices[symbol]
      const noise = random(-item.volatility, item.volatility)
      const eventImpact = getNewsImpact(news, symbol, item)
      const move = clamp(regimeBias(market.regime, item) + noise + eventImpact, -0.35, 0.35)
      const nextPrice = Math.max(1, Math.round(oldPrice * (1 + move)))
      market.prices[symbol] = nextPrice
      market.history[symbol].push(nextPrice)
      if (market.history[symbol].length > 30) market.history[symbol].shift()
    }
  }
  market.updatedAt += ticks * TICK_MS
  market.sequence = (market.sequence || 0) + ticks
  market.news = (market.news || []).slice(0, 12)
  return true
}

function ensureInvest(user) {
  if (!user.invest) user.invest = {}
  if (!user.invest.portfolio) user.invest.portfolio = {}
  if (!Array.isArray(user.invest.history)) user.invest.history = []
  if (!Array.isArray(user.invest.watchlist)) user.invest.watchlist = []
  user.invest.realized = Number(user.invest.realized) || 0
  return user.invest
}

function resolveSymbol(input) {
  if (!input) return null
  const value = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (INSTRUMENTS[value]) return value
  const found = Object.entries(INSTRUMENTS).find(([, item]) => item.name.toUpperCase().replace(/[^A-Z0-9]/g, '') === value)
  return found?.[0] || null
}

function formatChange(current, history) {
  const previous = history?.[history.length - 2]
  if (!previous) return '0.00%'
  const change = ((current - previous) / previous) * 100
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
}

function statusIcon(value) {
  return Number.isFinite(value) && value >= 0 ? 'UP' : 'DOWN'
}

function marketHeader(market) {
  const next = Math.max(0, Math.ceil((TICK_MS - (Date.now() - market.updatedAt)) / 60000))
  return `MARKET: ${MARKET_NAMES[market.regime] || market.regime} | UPDATE: ${next}m`
}

function portfolioValue(invest, market) {
  return Object.entries(invest.portfolio).reduce((sum, [symbol, holding]) => sum + holding.qty * market.prices[symbol], 0)
}

function portfolioCost(invest) {
  return Object.values(invest.portfolio).reduce((sum, holding) => sum + holding.qty * holding.avgPrice, 0)
}

function historyLine(entry) {
  const action = entry.side === 'BUY' ? 'BELI' : 'JUAL'
  const extra = entry.side === 'SELL' && Number.isFinite(entry.realized) ? `\n   P/L: ${signedMoney(entry.realized)}` : ''
  return `• ${action} ${entry.symbol} x${number(entry.qty)}\n   Harga: ${money(entry.price)} | Fee: ${money(entry.fee)}${extra}`
}

function getBankProfile(user) {
  const tierId = Number.isInteger(Number(user.bankTier)) && BANK_TIERS[user.bankTier]
    ? Number(user.bankTier)
    : 0
  return { id: tierId, ...BANK_TIERS[tierId] }
}

let handler = async (m, { text, usedPrefix }) => {
  const db = loadDB()
  const data = getUserRPG(db, m.sender)
  const user = data?.rpg || data
  if (!user || data?.isDummy) return m.reply('Kamu belum memiliki data RPG. Mulai dengan .adventure.')
  if (user.bank === undefined) user.bank = 0

  const market = ensureMarket(db)
  const changed = tickMarket(market)
  const invest = ensureInvest(user)
  const bankProfile = getBankProfile(user)
  if (changed) await saveDB(db)

  const args = (text || '').trim().split(/\s+/).filter(Boolean)
  const action = (args[0] || 'market').toLowerCase()
  const prefix = usedPrefix || '.'

  if (action === 'help' || action === 'guide' || action === 'panduan') {
    return m.reply(
      `${title('INVEST RPG GUIDE')}\n` +
      `${prefix}invest list\n` +
      `${prefix}invest market [kategori]\n` +
      `${prefix}invest price <symbol>\n` +
      `${prefix}invest buy <symbol> <jumlah>\n` +
      `${prefix}invest sell <symbol> <jumlah>\n` +
      `${prefix}invest portfolio\n` +
      `${prefix}invest news\n` +
      `${prefix}invest chart <symbol>\n` +
      `${prefix}invest watch add/del <symbol>\n` +
      `${prefix}invest watch list\n` +
      `${prefix}invest history\n\n` +
      `Alur dasar:\n` +
      `1. Cek ${prefix}invest market\n` +
      `2. Baca ${prefix}invest news\n` +
      `3. Beli dengan ${prefix}invest buy BTC 0.01\n` +
      `4. Pantau ${prefix}invest portfolio\n` +
      `5. Jual saat target tercapai\n\n` +
      `Fee transaksi: ${(FEE_RATE * 100).toFixed(2)}%\n` +
      `Semua transaksi memakai saldo bank RPG.\n${footer()}`
    )
  }

  if (action === 'list' || action === 'instrumen' || action === 'assets') {
    const category = args.slice(1).join(' ').toLowerCase()
    const grouped = {}
    for (const [symbol, item] of Object.entries(INSTRUMENTS)) {
      if (category && item.category.toLowerCase() !== category) continue
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(`${symbol} (${item.name})`)
    }
    const sections = Object.entries(grouped).map(([name, symbols]) => {
      const rows = symbols.map((symbol, index) => `${index + 1}. ${symbol}`).join('\n')
      return `*${name}*\n${rows}`
    })
    if (!sections.length) return m.reply('Kategori tidak ditemukan. Gunakan .invest list atau .invest guide.')
    return m.reply(`${title('DAFTAR INSTRUMEN')}\n\n${sections.join(`\n\n${line}\n\n`)}\n\nGunakan *.invest market* untuk melihat harga.\n${footer()}`)
  }

  if (action === 'market' || action === 'harga') {
    const category = args.slice(1).join(' ').toLowerCase()
    const entries = Object.entries(INSTRUMENTS).filter(([, item]) => !category || item.category.toLowerCase() === category)
    if (!entries.length) return m.reply('Kategori tidak ditemukan. Cek dengan .invest help.')
    let message = `${title('MARKET')}\n${marketHeader(market)}\n\n`
    let currentCategory = ''
    let categoryIndex = 0
    for (const [symbol, item] of entries) {
      if (item.category !== currentCategory) {
        currentCategory = item.category
        categoryIndex = 0
        message += `\n*${currentCategory}*\n`
      }
      categoryIndex++
      message += `${categoryIndex}. *${symbol}* ${item.name}\n   ${money(market.prices[symbol])} | ${statusIcon(market.prices[symbol] - market.history[symbol][market.history[symbol].length - 2])} ${formatChange(market.prices[symbol], market.history[symbol])}\n`
    }
    return m.reply(`${message.trim()}\n${footer()}`)
  }

  if (action === 'price' || action === 'quote') {
    const symbol = resolveSymbol(args[1])
    if (!symbol) return m.reply('Symbol tidak ditemukan. Contoh: .invest price BTC')
    const item = INSTRUMENTS[symbol]
    const current = market.prices[symbol]
    return m.reply(
      `${title(`${symbol} • ${item.name}`)}\n` +
      `Kategori  : ${item.category}\n` +
      `Harga     : ${money(current)}\n` +
      `Perubahan : ${formatChange(current, market.history[symbol])}\n` +
      `Risiko    : ${item.risk}\n` +
      `Volatilitas: ${(item.volatility * 100).toFixed(1)}% / tick\n` +
      `${marketHeader(market)}\n${footer()}`
    )
  }

  if (action === 'buy' || action === 'beli' || action === 'sell' || action === 'jual') {
    const symbol = resolveSymbol(args[1])
    const qty = Number(args[2])
    if (!symbol || !Number.isFinite(qty) || qty <= 0) return m.reply(`Format: ${prefix}invest ${action} <symbol> <jumlah>`)
    if (qty > 1000000000) return m.reply('Jumlah transaksi terlalu besar.')
    const item = INSTRUMENTS[symbol]
    const price = market.prices[symbol]
    const gross = price * qty
    const fee = Math.ceil(gross * FEE_RATE)
    const total = action === 'buy' || action === 'beli' ? gross + fee : gross - fee
    const holding = invest.portfolio[symbol] || { qty: 0, avgPrice: 0 }

    if (action === 'buy' || action === 'beli') {
      if (user.kartuBeku) return m.reply(`Kartu bank ${bankProfile.name} sedang beku. Aktifkan kembali melalui *.bank*.`)
      if (user.bank < total) return m.reply(`Saldo bank tidak cukup. Butuh ${money(total)}.`)
      user.bank -= total
      const nextQty = holding.qty + qty
      holding.avgPrice = ((holding.qty * holding.avgPrice) + gross) / nextQty
      holding.qty = nextQty
      invest.portfolio[symbol] = holding
      invest.history.unshift({ side: 'BUY', symbol, qty, price, fee, at: Date.now() })
      invest.history = invest.history.slice(0, 30)
      await saveDB(db)
      return m.reply(`${title('BELI BERHASIL')}\nAset       : *${symbol}*\nJumlah     : ${number(qty)}\nHarga      : ${money(price)}\nModal      : ${money(gross)}\nFee        : ${money(fee)}\nSaldo bank : ${money(user.bank)}\n${footer()}`)
    }

    if (user.kartuBeku) return m.reply(`Kartu bank ${bankProfile.name} sedang beku. Aktifkan kembali melalui *.bank*.`)
    if (holding.qty < qty) return m.reply(`Kepemilikan ${symbol} tidak cukup. Kamu punya ${number(holding.qty)}.`)
    const cost = holding.avgPrice * qty
    const realized = (gross - fee) - cost
    user.bank += total
    holding.qty -= qty
    invest.realized += realized
    if (holding.qty <= 0) delete invest.portfolio[symbol]
    else invest.portfolio[symbol] = holding
    invest.history.unshift({ side: 'SELL', symbol, qty, price, fee, realized, at: Date.now() })
    invest.history = invest.history.slice(0, 30)
    await saveDB(db)
    return m.reply(`${title('JUAL BERHASIL')}\nAset       : *${symbol}*\nJumlah     : ${number(qty)}\nHarga      : ${money(price)}\nHasil bersih: ${money(total)}\nRealized P/L: ${signedMoney(realized)}\nSaldo bank : ${money(user.bank)}\n${footer()}`)
  }

  if (action === 'portfolio' || action === 'portofolio' || action === 'pf') {
    const value = portfolioValue(invest, market)
    const cost = portfolioCost(invest)
    const floating = value - cost
    let message = `${title('PORTFOLIO')}\n${marketHeader(market)}\n` +
      `Bank       : ${bankProfile.color} ${bankProfile.name}${user.kartuBeku ? ' • BEKU' : ' • AKTIF'}\n` +
      `Saldo bank  : ${money(user.bank)}\n` +
      `Nilai aset  : ${money(value)}\n` +
      `Floating P/L: ${signedMoney(floating)}\n` +
      `Realized P/L: ${signedMoney(invest.realized)}\n`
    const entries = Object.entries(invest.portfolio)
    if (!entries.length) message += '\nBelum ada aset. Gunakan .invest buy <symbol> <jumlah>.'
    entries.forEach(([symbol, holding], index) => {
      const current = market.prices[symbol]
      const pnl = (current - holding.avgPrice) * holding.qty
      message += `\n${index + 1}. *${symbol}* x${number(holding.qty)}\n   Modal: ${money(holding.avgPrice)}\n   Nilai: ${money(current)} | P/L: ${signedMoney(pnl)}\n`
    })
    return m.reply(`${message.trim()}\n${footer()}`)
  }

  if (action === 'news' || action === 'berita') {
    const news = market.news || []
    if (!news.length) return m.reply(`Belum ada berita market.\n${marketHeader(market)}`)
    return m.reply(`${title('MARKET NEWS')}\n${marketHeader(market)}\n\n` + news.slice(0, 8).map((item, index) => `${index + 1}. ${item.text}`).join('\n\n') + `\n${footer()}`)
  }

  if (action === 'chart' || action === 'grafik') {
    const symbol = resolveSymbol(args[1])
    if (!symbol) return m.reply('Symbol tidak ditemukan. Contoh: .invest chart BTC')
    const values = market.history[symbol]
    const min = Math.min(...values)
    const max = Math.max(...values)
    const bars = values.slice(-20).map(value => {
      const level = max === min ? 1 : Math.ceil(((value - min) / (max - min)) * 8)
      return ' .:-=+*#@'[level]
    }).join('')
    return m.reply(`${title(`CHART ${symbol}`)}\n${bars}\n\nTerendah: ${money(min)}\nTertinggi: ${money(max)}\nSekarang: ${money(market.prices[symbol])}\n${footer()}`)
  }

  if (action === 'watch' || action === 'watchlist') {
    const sub = args[1]?.toLowerCase()
    if (sub === 'add' || sub === 'tambah') {
      const symbol = resolveSymbol(args[2])
      if (!symbol) return m.reply('Symbol tidak ditemukan.')
      if (!invest.watchlist.includes(symbol)) invest.watchlist.push(symbol)
      await saveDB(db)
      return m.reply(`${symbol} ditambahkan ke watchlist.`)
    }
    if (sub === 'del' || sub === 'remove' || sub === 'hapus') {
      const symbol = resolveSymbol(args[2])
      invest.watchlist = invest.watchlist.filter(item => item !== symbol)
      await saveDB(db)
      return m.reply(`${symbol || 'Symbol'} dihapus dari watchlist.`)
    }
    if (!invest.watchlist.length) return m.reply('Watchlist kosong. Gunakan .invest watch add BTC')
    return m.reply(`${title('WATCHLIST')}\n\n` + invest.watchlist.map((symbol, index) => `${index + 1}. *${symbol}*\n   ${money(market.prices[symbol])} | ${formatChange(market.prices[symbol], market.history[symbol])}`).join('\n\n') + `\n${footer()}`)
  }

  if (action === 'history' || action === 'riwayat') {
    if (!invest.history.length) return m.reply('Belum ada riwayat transaksi.')
    return m.reply(`${title('RIWAYAT TRANSAKSI')}\n\n` + invest.history.slice(0, 15).map(historyLine).join(`\n\n${line}\n\n`) + `\n${footer()}`)
  }

  return m.reply(`Command tidak dikenal. Gunakan ${prefix}invest help.`)
}

handler.help = ['invest', 'invest market', 'invest buy <symbol> <jumlah>', 'invest sell <symbol> <jumlah>', 'invest portfolio']
handler.tags = ['rpg']
handler.command = ['invest', 'trading']
handler.group = true
export default handler
