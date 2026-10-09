import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Camera,
  Cpu,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Droplets,
  Armchair,
  Trash2,
  Wifi,
  DoorClosed,
  Wind,
  GraduationCap,
  FlaskConical,
  Bath,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onTrackWithId?: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onTrackWithId }) => {
  const categories = [
    {
      name: 'Electrical',
      desc: 'Ceiling fans, lighting, switchboards, wiring, power sockets',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      name: 'Plumbing',
      desc: 'Water taps, leakage, broken pipes, flush tanks, sink overflow',
      icon: Droplets,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      name: 'Furniture',
      desc: 'Broken benches, wobbly desks, damaged chairs, podiums',
      icon: Armchair,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      name: 'Cleanliness',
      desc: 'Litter, unemptied dustbins, stains, classroom sweeping',
      icon: Trash2,
      color: 'text-lime-600 bg-lime-50 border-lime-200',
    },
    {
      name: 'Network / Wi-Fi',
      desc: 'Campus Wi-Fi connectivity, LAN ports, router outages',
      icon: Wifi,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      name: 'Infrastructure',
      desc: 'Cracked walls, broken windows, doors, floor tiles, stairs',
      icon: DoorClosed,
      color: 'text-stone-600 bg-stone-50 border-stone-200',
    },
    {
      name: 'Ventilation & AC',
      desc: 'Suffocating lecture rooms, broken exhaust fans, AC cooling',
      icon: Wind,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      name: 'Washroom & Hygiene',
      desc: 'Urinal blockages, missing soaps, dirty mirrors, door latches',
      icon: Bath,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      name: 'Classroom Tech',
      desc: 'Overhead projectors, speakers, digital smartboards, mics',
      icon: GraduationCap,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      name: 'Laboratories',
      desc: 'Damaged gas pipelines, glassware, fume hoods, equipment',
      icon: FlaskConical,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      name: 'Campus Security',
      desc: 'Broken perimeter gates, dark pathways, locks, lost property',
      icon: ShieldCheck,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      name: 'General Campus',
      desc: 'Cafeteria hygiene, sports facilities, library issues, noise',
      icon: HelpCircle,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen Smart College Maintenance</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
                  Campus Guard
                </h1>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Report. Track. Improve.
                </p>
              </div>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                An intelligent campus issue reporting platform that helps students report problems
                and helps authorities resolve them faster. Powered by automated AI triage and
                transparent status tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('report')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition text-base"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onNavigate('track')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-xl shadow-sm transition text-base"
                >
                  <Eye className="w-5 h-5 text-slate-500" />
                  <span>Track Complaint</span>
                </button>
              </div>

              {/* Quick stats badge */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Realtime Dispatch to 10+ Departments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Zero Student Login Friction</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>AI Multimodal Assistance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Dashboard / Live Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />

                <div className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Live Issue Triage Example
                      </span>
                    </div>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      CG-2026-8F42K
                    </span>
                  </div>

                  {/* Sample Complaint Card Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Electrical
                        </span>
                        <h4 className="font-semibold text-slate-900 mt-1.5 text-base leading-snug">
                          Ceiling fan motor burning smell & wobbling
                        </h4>
                      </div>
                      <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                        High Priority
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Academic Block • 2nd Floor • Room 204</span>
                    </div>

                    {/* AI analysis badge */}
                    <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                          AI Department Routing
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          96% Confidence
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Routed directly to <strong className="text-slate-800">Electrical Department</strong>.
                        Triage marked high urgency due to safety hazard in lecture room.
                      </p>
                    </div>

                    {/* Timeline Preview */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-medium text-slate-500 mb-2">Status Timeline:</div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submitted</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Under Review</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <div className="flex items-center gap-1 text-blue-600 font-semibold animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Action */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        if (onTrackWithId) onTrackWithId('CG-2026-DEMO1');
                        else onNavigate('track');
                      }}
                      className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/60 py-2 rounded-lg transition"
                    >
                      Try Interactive Sample Tracking →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Engineered For Colleges
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Students & Campus Staff Trust Campus Guard
          </h3>
          <p className="text-slate-600 text-sm">
            Say goodbye to forgotten paper complaint registers and delayed WhatsApp threads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">1. Easy Reporting</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Report campus problems with a photo and location in seconds. No complicated account
              creation or passwords required for students.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">2. Smart Classification</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              AI helps identify the type of issue and route it to the appropriate department with
              intelligent urgency assessment and local fallback reliability.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">3. Transparent Tracking</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Track your complaint from submission to resolution. Instant status updates, inspection
              logs, and real-time maintenance updates with unique tracking IDs.
            </p>
          </div>
        </div>
      </section>

      {/* How Campus Guard Works Section */}
      <section className="bg-slate-50/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple 5-Step Lifecycle
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Campus Guard Works
            </h3>
            <p className="text-slate-600 text-sm">
              From the instant a student spots an issue to the final sign-off by facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Student Reports Issue',
                desc: 'Uploads a photo, selects the campus block, floor, and room.',
              },
              {
                step: '02',
                title: 'AI Analyzes Issue',
                desc: 'Gemini AI reads photo & text to extract urgency, department, and context.',
              },
              {
                step: '03',
                title: 'Routed to Department',
                desc: 'Dispatched to Electrical, Plumbing, IT, Housekeeping, or Maintenance.',
              },
              {
                step: '04',
                title: 'Staff Reviews & Resolves',
                desc: 'Technicians inspect on site, update progress, and log fix verification.',
              },
              {
                step: '05',
                title: 'Student Tracks Status',
                desc: 'Watch real-time resolution progression with the unique complaint ID.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 relative group hover:border-blue-300 transition"
              >
                <div className="text-2xl font-black text-blue-600/40 group-hover:text-blue-600 transition">
                  {s.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Issue Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Campus Domains
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Supported Issue Categories
          </h3>
          <p className="text-slate-600 text-sm">
            Everything from lecture rooms to labs, hostels, and sports grounds is covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition flex items-start gap-3.5"
              >
                <div className={`p-2.5 rounded-lg border shrink-0 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{cat.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-500/20">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              See something wrong on campus?
            </h3>
            <p className="text-blue-100 text-base sm:text-lg">
              Report it now. Your submission alerts campus facilities in real-time.
            </p>
          </div>
          <button
            onClick={() => onNavigate('report')}
            className="shrink-0 bg-white hover:bg-blue-50 text-blue-700 font-bold px-8 py-4 rounded-xl shadow-md transition active:scale-[0.98] text-base"
          >
            Report an Issue
          </button>
        </div>
      </section>
    </div>
  );
};
