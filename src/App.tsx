/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Brain, 
  ShieldCheck, 
  Globe, 
  Smartphone, 
  Megaphone, 
  Phone, 
  Mail, 
  MessageCircle, 
  Send,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { auth, signInWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const SERVICES = [
  {
    id: 'robotics',
    title: 'Robotics Programming',
    description: 'Advanced automation and robotic systems integration.',
    details: 'We specialize in industrial automation, autonomous mobile robots (AMR), and custom robotic arm programming. Our systems are designed for precision, safety, and efficiency.',
    options: ['Industrial Automation', 'Autonomous Navigation', 'Robotic Arm Control', 'Sensor Integration'],
    icon: Cpu,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'ai',
    title: 'AI Master',
    description: 'Custom machine learning models and intelligent solutions.',
    details: 'From predictive analytics to natural language processing, we build AI that solves real-world problems. Our expertise includes computer vision, recommendation engines, and generative AI.',
    options: ['Predictive Analytics', 'Natural Language Processing', 'Computer Vision', 'Generative AI Solutions'],
    icon: Brain,
    color: 'from-orange-400 to-orange-500'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Robust protection for your digital assets and infrastructure.',
    details: 'Protect your business from evolving threats. We provide comprehensive security audits, penetration testing, and real-time monitoring solutions.',
    options: ['Network Scanning', 'Penetration Testing', 'Security Audits', 'Incident Response'],
    icon: ShieldCheck,
    color: 'from-orange-600 to-orange-700'
  },
  {
    id: 'web',
    title: 'Website Engineer',
    description: 'High-performance, scalable web applications and platforms.',
    details: 'We build modern, responsive, and SEO-optimized websites using the latest technologies. Our focus is on user experience, performance, and scalability.',
    options: ['E-commerce Platforms', 'Corporate Websites', 'Web Applications', 'UI/UX Design'],
    icon: Globe,
    color: 'from-orange-500 to-orange-400'
  },
  {
    id: 'mobile',
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile experiences.',
    details: 'Deliver your services directly to your users\' pockets. We develop high-quality mobile apps for iOS and Android that are fast, intuitive, and reliable.',
    options: ['iOS Development', 'Android Development', 'Cross-Platform (React Native)', 'Mobile UI Design'],
    icon: Smartphone,
    color: 'from-orange-700 to-orange-600'
  },
  {
    id: 'ads',
    title: 'Online Ad Creator',
    description: 'Strategic digital marketing and ad campaign management.',
    details: 'Boost your online presence and reach your target audience effectively. We create and manage high-converting ad campaigns across multiple platforms.',
    options: ['Social Media Ads', 'Google Search Ads', 'Display Advertising', 'Content Strategy'],
    icon: Megaphone,
    color: 'from-orange-400 to-orange-600'
  }
];

const CONTACT_INFO = {
  phone: '0204558695',
  email: 'plutoescoba4@gmail.com',
  whatsapp: 'https://wa.me/233204558695',
  telegram: 'https://t.me/plutoescoba4'
};

export default function App() {
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user to Firestore
        setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  const handleOrder = async (platform: 'whatsapp' | 'telegram') => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (!selectedService || !selectedOption) return;

    setOrderStatus('submitting');
    try {
      // Save order to Firestore
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        option: selectedOption,
        platform: platform,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setOrderStatus('success');
      
      // Redirect to chat
      const message = `Hello Pluto-tech, I am ${user.displayName} (${user.email}). I want to place an order for ${selectedService.title} - ${selectedOption}.`;
      const encodedMessage = encodeURIComponent(message);
      
      const url = platform === 'whatsapp' 
        ? `${CONTACT_INFO.whatsapp}?text=${encodedMessage}`
        : `${CONTACT_INFO.telegram}?text=${encodedMessage}`;
      
      setTimeout(() => {
        window.open(url, '_blank');
        setOrderStatus('idle');
        setSelectedService(null);
        setSelectedOption(null);
      }, 1500);

    } catch (error) {
      console.error("Error placing order:", error);
      setOrderStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">P</div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">PLUTO<span className="text-orange-600">-TECH</span></span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Services', 'About', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-orange-600 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon size={16} />
                  )}
                  <span className="text-xs font-bold text-slate-700">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={logout} className="text-slate-400 hover:text-orange-600 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-orange-600 transition-all hover:shadow-xl hover:shadow-orange-200 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-8">
              {['Services', 'About', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-black text-slate-900"
                >
                  {item}
                </a>
              ))}
              {user ? (
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl text-xl font-bold"
                >
                  Sign Out
                </button>
              ) : (
                <button 
                  onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl text-xl font-bold"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-orange-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Next-Gen Tech Solutions
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900 mb-8">
                ENGINEERING <br />
                <span className="text-orange-600">THE FUTURE.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-md mb-10 leading-relaxed">
                Pluto-tech provides cutting-edge solutions in robotics, AI, and cybersecurity to empower your business in the digital age.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#services"
                  className="bg-orange-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2 group"
                >
                  Explore Services
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </a>
                {!user && (
                  <button 
                    onClick={signInWithGoogle}
                    className="bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-200 transition-all"
                  >
                    Join Pluto-tech
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Robotics"
                  className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold">Robotics Engine v2.0</div>
                      <div className="text-white/60 text-sm">Active Deployment</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-600 rounded-3xl -z-10 animate-bounce-slow"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-slate-900 rounded-full -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4">What We Do</div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">CORE EXPERTISE</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-lg">
              We specialize in complex technical challenges, from hardware programming to digital marketing strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  setSelectedService(service);
                  setSelectedOption(null);
                }}
                className={`group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-orange-200 transition-all cursor-pointer ${selectedService?.id === service.id ? 'ring-4 ring-orange-500/20 border-orange-500' : ''}`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  <service.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-8">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-bold group-hover:gap-4 transition-all">
                  View Options <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className={`md:w-1/3 bg-gradient-to-br ${selectedService.color} p-12 text-white flex flex-col justify-between`}>
                <div>
                  <selectedService.icon size={64} className="mb-8" />
                  <h3 className="text-4xl font-black leading-tight mb-4">{selectedService.title}</h3>
                  <p className="text-white/80 leading-relaxed">{selectedService.details}</p>
                </div>
                <div className="hidden md:block text-xs font-bold uppercase tracking-widest opacity-50">Pluto-tech Engineering</div>
              </div>
              
                <div className="md:w-2/3 p-8 md:p-12 overflow-y-auto max-h-[80vh] md:max-h-none relative">
                  <div className="flex justify-between items-center mb-8">
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold transition-colors"
                    >
                      <ArrowLeft size={20} />
                      Back to Services
                    </button>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={32} />
                    </button>
                  </div>

                <h4 className="text-sm font-bold uppercase tracking-widest text-orange-600 mb-6">Select a System / Option</h4>
                <div className="grid gap-3 mb-12">
                  {selectedService.options.map(option => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${selectedOption === option ? 'border-orange-600 bg-orange-50 text-orange-600 shadow-md' : 'border-slate-100 hover:border-orange-200 text-slate-700'}`}
                    >
                      <span className="font-bold text-lg">{option}</span>
                      {selectedOption === option && <CheckCircle2 size={24} />}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Place Order via</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={!selectedOption || orderStatus !== 'idle'}
                      onClick={() => handleOrder('whatsapp')}
                      className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                      <MessageCircle size={24} />
                      WhatsApp
                    </button>
                    <button
                      disabled={!selectedOption || orderStatus !== 'idle'}
                      onClick={() => handleOrder('telegram')}
                      className="flex items-center justify-center gap-3 bg-[#0088cc] text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                      <Send size={24} />
                      Telegram
                    </button>
                  </div>
                  
                  {orderStatus === 'submitting' && (
                    <div className="text-center text-orange-600 font-bold animate-pulse">Processing your order...</div>
                  )}
                  {orderStatus === 'success' && (
                    <div className="text-center text-green-600 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} /> Order Placed! Redirecting...
                    </div>
                  )}
                  
                  {!user && (
                    <p className="text-center text-slate-400 text-sm">
                      You'll be asked to sign in with Google to complete your order.
                    </p>
                  )}

                  <div className="pt-8 mt-8 border-t border-slate-100">
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Return to Main Page
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
                READY TO <br />
                <span className="text-orange-500">CONNECT?</span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                Have a project in mind? Reach out through any of our channels. We're available on WhatsApp and Telegram for quick responses.
              </p>

              <div className="space-y-6">
                <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Call Us</div>
                    <div className="text-2xl font-bold">{CONTACT_INFO.phone}</div>
                  </div>
                </a>
                <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Email Us</div>
                    <div className="text-2xl font-bold">{CONTACT_INFO.email}</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10">
              <h3 className="text-2xl font-bold mb-8">Direct Message</h3>
              <div className="grid gap-4">
                <button 
                  onClick={() => window.open(CONTACT_INFO.whatsapp, '_blank')}
                  className="flex items-center justify-between bg-[#25D366] text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform group"
                >
                  <div className="flex items-center gap-4">
                    <MessageCircle size={32} />
                    <div className="text-left">
                      <div className="font-bold text-xl">WhatsApp</div>
                      <div className="text-white/80 text-sm">Instant Chat</div>
                    </div>
                  </div>
                  <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </button>

                <button 
                  onClick={() => window.open(CONTACT_INFO.telegram, '_blank')}
                  className="flex items-center justify-between bg-[#0088cc] text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform group"
                >
                  <div className="flex items-center gap-4">
                    <Send size={32} />
                    <div className="text-left">
                      <div className="font-bold text-xl">Telegram</div>
                      <div className="text-white/80 text-sm">Secure Message</div>
                    </div>
                  </div>
                  <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10">
                <p className="text-slate-500 text-sm leading-relaxed">
                  By reaching out, you agree to our terms of service. We typically respond within 2-4 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-xl font-black tracking-tighter text-slate-900">PLUTO<span className="text-orange-600">-TECH</span></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © 2026 Pluto-tech. All rights reserved. Engineering the future, one line of code at a time.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
