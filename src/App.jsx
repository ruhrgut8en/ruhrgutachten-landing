import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Shield, Car, Award, ClipboardCheck, Clock, MapPin, Phone, ArrowRight, ChevronDown, Star, Zap, TrendingUp, Users } from 'lucide-react';

// ─── Scroll-triggered reveal ─────────────────────────────────
function Reveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const dirMap = { up: { y: 60 }, down: { y: -60 }, left: { x: -60 }, right: { x: 60 } };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated Counter ────────────────────────────────────────
function Counter({ end, label, icon: Icon, duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);
  
  return (
    <motion.div ref={ref} className="text-center p-6"
      whileHover={{ scale: 1.05 }}>
      {Icon && <Icon className="w-8 h-8 text-gold mx-auto mb-3" />}
      <div className="text-4xl font-bold text-gradient mb-1">{count}+</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </motion.div>
  );
}

// ─── Service Card ────────────────────────────────────────────
function ServiceCard({ icon: Icon, title, desc, index }) {
  return (
    <Reveal delay={index * 0.15}>
      <motion.div
        className="group relative bg-charcoal-light border border-gray-800 rounded-2xl p-8 cursor-pointer overflow-hidden"
        whileHover={{ y: -8, borderColor: '#c8a44e', boxShadow: '0 20px 60px rgba(200,164,78,0.1)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div whileHover={{ rotate: 5, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Icon className="w-10 h-10 text-gold mb-5" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
        <motion.div className="mt-4 flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Mehr erfahren <ArrowRight className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </Reveal>
  );
}

// ─── Floating Particles ──────────────────────────────────────
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  
  const services = [
    { icon: Shield, title: 'Schadengutachten', desc: 'Haftpflicht, Kasko & Kurzgutachten mit präziser Kalkulation nach DAT/Audatex. Gerichtsfest und wasserdicht dokumentiert.' },
    { icon: TrendingUp, title: 'Wertgutachten', desc: 'Wiederbeschaffungswert, Restwert & Marktwert-Ermittlung. Für Versicherungen, Gerichte und Privatverkauf.' },
    { icon: Award, title: 'Oldtimerbewertung', desc: 'Zustandsbewertung nach FIVA-Richtlinien. Wertgutachten für Versicherung, Verkauf & Nachlass.' },
    { icon: Car, title: 'Leasingrückläufer', desc: 'Fair-Use-Zustandsbericht bei Leasingende. Neutral, herstellerkonform, belastbar.' },
    { icon: ClipboardCheck, title: 'Rechnungsprüfung', desc: 'Plausibilitätsprüfung von Werkstattrechnungen. Transparenz für Versicherung & Kunde.' },
    { icon: Zap, title: 'Foto-Dokumentation', desc: 'Digitale Schadenaufnahme mit hochauflösender Bilddokumentation. Gerichtsfest & revisionssicher.' },
  ];

  return (
    <div className="relative">
      <Particles />
      
      {/* ─── HERO ─────────────────────────────────── */}
      <motion.section ref={heroRef} style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center bg-mesh overflow-hidden">
        
        {/* Geometric background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
          <motion.div className="absolute top-1/3 left-1/4 w-64 h-64 border border-gold/10 rounded-full"
            animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute bottom-1/4 right-1/3 w-48 h-48 border border-gold/5 rounded-full"
            animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <Reveal>
            <motion.div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8"
              animate={{ boxShadow: ['0 0 0px rgba(200,164,78,0)', '0 0 20px rgba(200,164,78,0.15)', '0 0 0px rgba(200,164,78,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}>
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-gold-light text-sm font-medium">Unabhängiger KFZ-Sachverständiger</span>
            </motion.div>
          </Reveal>
          
          <Reveal delay={0.2}>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              <span className="text-gradient">Ruhr</span>gutachten
            </h1>
          </Reveal>
          
          <Reveal delay={0.4}>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Präzision. Vertrauen. Expertise. <br/>
              <span className="text-gray-300">Ihr Fahrzeug in den besten Händen.</span>
            </p>
          </Reveal>
          
          <Reveal delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a href="#kontakt" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-gold text-black font-semibold px-8 py-4 rounded-full text-lg shadow-lg shadow-gold/20">
                <Phone className="w-5 h-5" /> Jetzt Kontakt aufnehmen
              </motion.a>
              <motion.a href="#services" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 border border-gray-700 text-white font-semibold px-8 py-4 rounded-full text-lg hover:border-gold/50 transition-colors">
                Leistungen entdecken <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-6 h-6 text-gold/50" />
        </motion.div>
      </motion.section>

      {/* ─── STATS BAR ──────────────────────────── */}
      <section className="relative z-10 -mt-1 border-t border-b border-gray-800 bg-charcoal/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <Counter end={2500} label="Gutachten erstellt" icon={ClipboardCheck} />
          <Counter end={20} label="Jahre Erfahrung" icon={Clock} />
          <Counter end={500} label="Zufriedene Partner" icon={Users} />
          <Counter end={98} label="Kundenzufriedenheit %" icon={Star} />
        </div>
      </section>

      {/* ─── SERVICES ───────────────────────────── */}
      <section id="services" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-gold text-sm font-semibold tracking-widest uppercase">Leistungen</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
                Was wir <span className="text-gradient">für Sie</span> tun
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Professionelle Fahrzeugbewertung mit modernster Technik und jahrzehntelanger Erfahrung.
              </p>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => <ServiceCard key={i} {...s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-charcoal/30">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-gold text-sm font-semibold tracking-widest uppercase">Ablauf</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
                So <span className="text-gradient">einfach</span> geht's
              </h2>
            </div>
          </Reveal>
          
          {[
            { step: '01', title: 'Kontaktaufnahme', desc: 'Schildern Sie uns Ihr Anliegen per WhatsApp, Telefon oder E-Mail. Wir melden uns innerhalb von 2 Stunden.' },
            { step: '02', title: 'Besichtigung', desc: 'Wir begutachten Ihr Fahrzeug vor Ort oder in unserer Partnerwerkstatt. Flexibel nach Ihrem Zeitplan.' },
            { step: '03', title: 'Gutachten', desc: 'Präzise Kalkulation nach DAT/Audatex mit detaillierter Schadenanalyse und hochauflösender Fotodokumentation.' },
            { step: '04', title: 'Übergabe', desc: 'Digitales Gutachten als PDF, persönliche Besprechung auf Wunsch. Parteiübergreifend einsetzbar.' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.2}>
              <motion.div className="flex gap-6 mb-12 group" whileHover={{ x: 8 }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-lg group-hover:bg-gold group-hover:text-black transition-all duration-300">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── TRUST / TESTIMONIAL ────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-gold text-sm font-semibold tracking-widest uppercase">Vertrauen</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
                Was unsere <span className="text-gradient">Partner</span> sagen
              </h2>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'Präzise, schnell und absolut zuverlässig. Seit Jahren unser erster Ansprechpartner für KFZ-Gutachten.', author: 'Markus K.', role: 'Werkstattleiter' },
              { quote: 'Die Gutachten sind wasserdicht. Noch nie Probleme vor Gericht gehabt. Goldstandard.', author: 'Dr. Sabine W.', role: 'Fachanwältin Verkehrsrecht' },
              { quote: 'Faire Preise, hervorragende Dokumentation. Als Versicherung schätzen wir die neutrale Expertise.', author: 'Thomas H.', role: 'Schadenregulierer' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.2}>
                <motion.div className="bg-charcoal-light border border-gray-800 rounded-2xl p-8 relative"
                  whileHover={{ y: -5, borderColor: '#c8a44e40' }}>
                  <div className="text-5xl text-gold/20 mb-4">"</div>
                  <p className="text-gray-300 leading-relaxed mb-6">{t.quote}</p>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="font-semibold text-white">{t.author}</div>
                    <div className="text-gray-500 text-sm">{t.role}</div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ────────────────────────────── */}
      <section id="kontakt" className="relative z-10 py-24 px-6 bg-mesh">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <span className="text-gold text-sm font-semibold tracking-widest uppercase">Kontakt</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-6">
              Bereit für <span className="text-gradient">Klarheit</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
              Ein Anruf, eine Nachricht — und Sie wissen, woran Sie sind.
            </p>
          </Reveal>
          
          <Reveal delay={0.3}>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Phone, label: 'Telefon', value: '+49 173 4444532', href: 'tel:+491734444532' },
                { icon: MapPin, label: 'Adresse', value: 'Robertstr. 88, 44809 Bochum', href: '#' },
                { icon: Clock, label: 'Öffnungszeiten', value: 'Mo–Fr 8–17 Uhr', href: '#' },
              ].map((c, i) => (
                <motion.a key={i} href={c.href}
                  className="bg-charcoal-light border border-gray-800 rounded-2xl p-6 hover:border-gold/30 transition-colors"
                  whileHover={{ y: -4 }}>
                  <c.icon className="w-6 h-6 text-gold mx-auto mb-3" />
                  <div className="text-white font-semibold mb-1">{c.label}</div>
                  <div className="text-gray-400 text-sm">{c.value}</div>
                </motion.a>
              ))}
            </div>
          </Reveal>
          
          <Reveal delay={0.5}>
            <motion.a href="https://wa.me/491734444532"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gold text-black font-bold px-10 py-5 rounded-full text-xl shadow-xl shadow-gold/30">
              <Phone className="w-6 h-6" /> Jetzt per WhatsApp melden
            </motion.a>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="relative z-10 border-t border-gray-800 bg-charcoal py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-white font-semibold">Ruhrgutachten</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 Ruhrgutachten — Unabhängiger KFZ-Sachverständiger
          </div>
        </div>
      </footer>
    </div>
  );
}
