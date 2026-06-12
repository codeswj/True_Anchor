import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BanknoteArrowDown,
  Building2,
  CreditCard,
  FileText,
  HandCoins,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  Phone,
  PiggyBank,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from 'lucide-react';
import logo from '../assets/ilovia-capital-logo.jpg';
import homeGrid from '../assets/landing-photos/photos/6.jpg';
import homeList from '../assets/landing-photos/photos/3.jpg';
import otpScreen from '../assets/landing-photos/photos/4.jpg';
import transferScreen from '../assets/landing-photos/photos/12.jpg';
import statementScreen from '../assets/landing-photos/photos/13.jpg';

const services = [
  { title: 'Withdraw Money', text: 'Move funds from your account when you need cash.', icon: BanknoteArrowDown },
  { title: 'Deposit via M-PESA', text: 'Top up FOSA, shares, and member deposits from mobile money.', icon: WalletCards },
  { title: 'Bank Transfer', text: 'Send money from your SACCO account to supported banks.', icon: Landmark },
  { title: 'Apply Loan', text: 'Request credit, pay installments, and check your limit.', icon: HandCoins },
  { title: 'Account Balance', text: 'View balances across biashara, deposits, and share capital.', icon: PiggyBank },
  { title: 'Statements', text: 'Generate account statements for custom periods.', icon: FileText },
  { title: 'Utilities', text: 'Buy airtime, pay bills, and handle daily payments.', icon: ReceiptText },
  { title: 'Guarantors', text: 'Track loan guarantor details from your account.', icon: Users },
];

const stats = [
  ['Mobile first', 'Access savings, loans, and payments from your phone.'],
  ['KES ready', 'Built around local SACCO flows and M-PESA deposits.'],
  ['Secure access', 'PIN and OTP flows protect member transactions.'],
];

const highlights = [
  { title: 'Member accounts', icon: Users },
  { title: 'Loan services', icon: CreditCard },
  { title: 'M-PESA deposits', icon: Smartphone },
  { title: 'Bank transfers', icon: Send },
  { title: 'Statements', icon: FileText },
  { title: 'In-app support', icon: MessageSquareText },
];

function PhoneShot({ src, alt, className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-900/20 ${className}`}>
      <img src={src} alt={alt} className="aspect-[9/16] h-full w-full rounded-[1.55rem] object-cover" />
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f7fafc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Ilovia Capital" className="h-10 w-10 rounded-md object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 sm:text-base">Ilovia Capital SACCO</p>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">Your success, our pride</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#services" className="hover:text-sky-700">Services</a>
            <a href="#security" className="hover:text-sky-700">Security</a>
            <a href="#channels" className="hover:text-sky-700">Channels</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-sky-600/20 hover:bg-sky-700">
              Join <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
              <ShieldCheck size={17} /> Mobile SACCO banking
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Ilovia Capital SACCO in your pocket
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Save, deposit, transfer, apply for loans, check balances, and request statements from one member portal built around real SACCO workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700">
                Open an account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">
                Member login
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {stats.map(([label, text]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] lg:min-h-[610px]">
            <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-100/80 blur-3xl" />
            <PhoneShot src={homeGrid} alt="Ilovia Capital mobile services grid" className="absolute left-[4%] top-8 h-[470px] rotate-[-5deg] sm:left-[12%] lg:left-[7%]" />
            <PhoneShot src={homeList} alt="Ilovia Capital mobile home services" className="absolute right-[3%] top-24 h-[430px] rotate-[5deg] sm:right-[14%] lg:right-[6%]" />
            <div className="absolute bottom-3 left-1/2 flex w-[min(92%,500px)] -translate-x-1/2 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                <LockKeyhole size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">PIN and OTP protected</p>
                <p className="text-xs leading-5 text-slate-500">Every sensitive member action stays behind secure authentication.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-sky-700">Services</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Everything members use most</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            The service list follows the app screens in your zip: daily transactions, savings visibility, loans, statements, and utility payments.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <Icon size={23} />
              </div>
              <h3 className="text-base font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="security" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <PhoneShot src={otpScreen} alt="OTP verification screen" className="h-[390px] self-start" />
            <PhoneShot src={transferScreen} alt="Bank transfer screen" className="mt-16 h-[390px]" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-normal text-emerald-700">Trust</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Protected access for member money</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              The member journey pairs familiar mobile screens with secure verification, clear account selection, and KES amount confirmation before money moves.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['OTP verification', LockKeyhole],
                ['Account selection', BadgeCheck],
                ['KES transaction forms', BanknoteArrowDown],
                ['Member help access', MessageSquareText],
              ].map(([title, Icon]) => (
                <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-sky-700">
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-black text-slate-800">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="channels" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-sky-700">Channels</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Built for branch and mobile members</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Give members the same confidence they expect at the branch: transparent accounts, loan actions, statements, and direct support.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ title, icon: Icon }) => (
              <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon size={20} />
                </div>
                <span className="text-sm font-black text-slate-800">{title}</span>
              </div>
            ))}
          </div>
        </div>

        <PhoneShot src={statementScreen} alt="Account statement screen" className="mx-auto h-[500px]" />
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-white md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-black">Ready to manage your SACCO account?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Join Ilovia Capital or sign in to continue to your member dashboard.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-400">
              Register <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Ilovia Capital SACCO. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2"><Building2 size={16} /> SACCO portal</span>
            <span className="inline-flex items-center gap-2"><Phone size={16} /> Mobile banking</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
