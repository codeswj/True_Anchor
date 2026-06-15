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
  ['24/7 access', 'Member services stay available beyond branch hours.'],
  ['KES ready', 'Built around local SACCO flows and M-PESA deposits.'],
  ['Secure by design', 'PIN and OTP flows protect member transactions.'],
];

const highlights = [
  { title: 'Member accounts', icon: Users },
  { title: 'Loan services', icon: CreditCard },
  { title: 'M-PESA deposits', icon: Smartphone },
  { title: 'Bank transfers', icon: Send },
  { title: 'Statements', icon: FileText },
  { title: 'In-app support', icon: MessageSquareText },
];

const trustItems = [
  ['OTP verification', 'Sensitive actions require an extra confirmation step.', LockKeyhole],
  ['Account selection', 'Members choose the right account before funds move.', BadgeCheck],
  ['KES transaction forms', 'Amounts and recipients are clear before submission.', BanknoteArrowDown],
  ['Member help access', 'Support is close to the workflows members use daily.', MessageSquareText],
];

const featuredServices = services.slice(0, 6);

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#02030a]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Ilovia Capital" className="h-10 w-10 rounded-md border border-white/10 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white sm:text-base">Ilovia Capital SACCO</p>
              <p className="hidden text-xs font-medium text-blue-200 sm:block">Your success, our pride</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-blue-100 md:flex">
            <a href="#services" className="transition hover:text-white">Services</a>
            <a href="#security" className="transition hover:text-white">Security</a>
            <a href="#channels" className="transition hover:text-white">Channels</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-bold text-blue-100 transition hover:bg-white/10">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-[#0727ff] px-3 py-2 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition hover:bg-[#001bd1]">
              Join <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-blue-950 bg-[#02030a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_85%,rgba(7,39,255,0.55),transparent_34%),linear-gradient(135deg,#02030a_0%,#050816_46%,#07145a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-5 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-400/30 bg-white/10 px-3 py-2 text-sm font-bold text-blue-100">
              <ShieldCheck size={17} /> Mobile SACCO banking
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              Ilovia Capital SACCO in your pocket
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-blue-100 sm:text-lg">
              Save, deposit, transfer, apply for loans, check balances, and request statements from one member portal built around real SACCO workflows.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-black text-[#0612a8] shadow-lg shadow-blue-700/30 transition hover:bg-blue-50">
                Open an account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15">
                Member login
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {stats.map(([label, text]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <p className="text-sm font-black text-white">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/[0.08] p-4 shadow-2xl shadow-blue-950/50 backdrop-blur">
            <div className="rounded-md border border-white/10 bg-[#050816] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-blue-200">Available from the start</p>
                  <h2 className="mt-1 text-2xl font-black text-white">Services members can use</h2>
                </div>
                <img src={logo} alt="Ilovia Capital" className="h-14 w-32 rounded-md border border-white/10 object-cover" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {featuredServices.map(({ title, icon: Icon }) => (
                  <div key={title} className="group flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-3 transition hover:border-blue-300/50 hover:bg-white/15">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0727ff] text-white shadow-lg shadow-blue-700/30">
                      <Icon size={20} />
                    </div>
                    <p className="text-sm font-black text-white">{title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-blue-400/20 bg-[#07145a]/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-normal text-blue-200">Fast member portal</p>
                    <p className="mt-1 text-sm font-black text-white">Savings, loans, payments, and support in one place</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0727ff] text-white">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#0612a8]">Services</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Everything members use most</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Daily transactions, savings visibility, loans, statements, and utility payments stay organized around the way SACCO members already work.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ title, text, icon: Icon }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#eef2ff] text-[#0612a8]">
                  <Icon size={23} />
                </div>
                <h3 className="text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-5 lg:px-8">
        <div className="grid gap-4 rounded-lg bg-[#02030a] p-4 text-white shadow-2xl shadow-blue-950/20 sm:grid-cols-3 sm:p-5">
          {stats.map(([label, text]) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-black text-white">{label}</p>
              <p className="mt-1 text-xs leading-5 text-blue-100">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="border-y border-blue-950 bg-[#050816] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-normal text-blue-200">Trust</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Protected access for member money</h2>
            <p className="mt-5 text-base leading-8 text-blue-100">
              The member journey pairs secure verification, clear account selection, and KES amount confirmation before money moves.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(([title, text, Icon]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0727ff] text-white">
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-xs leading-5 text-blue-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="channels" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-[#0612a8]">Channels</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Built for branch and mobile members</h2>
          </div>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Give members the same confidence they expect at the branch: transparent accounts, loan actions, statements, and direct support.
          </p>
          <Link to="/register" className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-[#0612a8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#001bd1]">
            Get started <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map(({ title, icon: Icon }) => (
            <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0612a8]">
                <Icon size={20} />
              </div>
              <span className="text-sm font-black text-slate-800">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#02030a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-white sm:px-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-black">Ready to manage your SACCO account?</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">Join Ilovia Capital or sign in to continue to your member dashboard.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0727ff] px-5 py-3 text-sm font-black text-white transition hover:bg-[#001bd1]">
              Register <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-8">
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
