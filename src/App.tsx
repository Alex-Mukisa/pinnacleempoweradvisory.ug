import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness, Check, Compass, Mail, MapPin, Menu, Phone, ShieldCheck, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import './App.css'
import { company, navigation, services } from './data/site'
import ChatAssistant from './components/ChatAssistant'

function Logo() { return <Link className="brand" to="/"><img src="/logo.gif" alt=""/><span><strong>Pinnacle</strong><small>Empower Advisory</small></span></Link> }

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="header-inner"><Logo/><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button><nav className={open ? 'primary-nav is-open' : 'primary-nav'} aria-label="Main navigation">{navigation.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>)}<Link className="button button-small" to="/contact" onClick={() => setOpen(false)}>Start a conversation <ArrowUpRight size={15}/></Link></nav></div></header>
}

function Footer() { return <footer className="site-footer"><div className="footer-main wrap"><div><Logo/><p>Thoughtful advisory for clearer decisions and confident next steps.</p></div><div><h3>Explore</h3>{navigation.slice(1, 6).map((item) => <Link className="footer-link" to={item.to} key={item.to}>{item.label}</Link>)}</div><div><h3>Get in touch</h3><a className="footer-link footer-email" href={`mailto:${company.email}`}><Mail size={17}/><span>{company.email}</span></a><a className="footer-link" href={`tel:${company.phone.replaceAll(' ', '')}`}><Phone size={15}/>{company.phone}</a><span className="footer-link"><MapPin size={15}/>{company.address}</span></div></div><div className="footer-bottom wrap"><span>© {new Date().getFullYear()} Pinnacle Empower Advisory</span><Link to="/privacy">Privacy policy</Link><span>Kampala, Uganda</span><span className="footer-credit">Developed by Alex Mukisa, CEO of Pinnacle Empower Advisory</span></div></footer> }
function ButtonLink({ to, children, outline = false }: { to: string; children: React.ReactNode; outline?: boolean }) { return <Link className={`button${outline ? ' button-outline' : ''}`} to={to}>{children}<ArrowRight size={16}/></Link> }
function Intro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <section className="page-intro wrap"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></section> }
function Reveal({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.section className={className} initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : delay }}>{children}</motion.section>
}
function Home() {
  return <>
    <section className="hero"><img className="hero-image" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85" alt="Contemporary business district buildings"/><div className="hero-shade"/><div className="hero-content wrap"><span className="eyebrow eyebrow-light">Pinnacle Empower Advisory Limited <i/></span><h1>Turning business decisions into <em>profitable opportunities.</em></h1><p>{company.intro}</p><div className="hero-actions"><ButtonLink to="/services">Explore our services</ButtonLink><ButtonLink to="/contact" outline>Talk to our team</ButtonLink></div></div><div className="hero-index"><span>01</span><span className="index-line"/><span>Kampala, Uganda</span></div></section>
    <Reveal className="mission-section wrap"><div className="mission-heading"><span className="eyebrow">Our mission</span><h2>Empowering entrepreneurs<br/>and investors to <em>grow profitably.</em></h2></div><p>{company.mission}</p></Reveal>
    <Reveal className="services-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">What we do</span><h2>Business, finance, and technology <em>working together.</em></h2></div><ButtonLink to="/services" outline>All services</ButtonLink></div><div className="service-grid">{services.map((item, i) => { const Icon = [BarChart3, Compass, ShieldCheck, BriefcaseBusiness, BarChart3][i]; return <article className="service-card" key={item.id}><div className="service-card-top"><span>{item.id}</span><Icon size={23}/></div><h3>{item.title}</h3><p>{item.description}</p><Link className="text-link" to="/services">Explore the approach <ArrowRight size={15}/></Link></article> })}</div></div></Reveal>
    <Reveal className="strengths-section"><div className="wrap"><div className="strengths-heading"><span className="eyebrow">Why choose Pinnacle</span><h2>Three strengths. <em>One connected perspective.</em></h2><p>We bring together the capabilities businesses need to understand performance, make sound financial decisions, and operate smarter.</p></div><div className="strengths-grid">{company.strengths.map((strength, i) => <article key={strength.title}><span className="strength-number">0{i + 1}</span><div className="strength-icon">{i === 0 ? <BarChart3/> : i === 1 ? <ShieldCheck/> : <BriefcaseBusiness/>}</div><h3>{strength.title}</h3><p>{strength.description}</p></article>)}</div></div></Reveal>
    <Reveal className="promise-band"><div className="wrap promise-inner"><span className="eyebrow eyebrow-light">Our promise</span><p>{company.promise}</p></div></Reveal>
    <Reveal className="cta-band"><div className="wrap cta-inner"><div><span className="eyebrow eyebrow-light">Begin a conversation</span><h2>Let’s make your next decision<br/><em>a profitable one.</em></h2></div><ButtonLink to="/contact">Get in touch</ButtonLink></div></Reveal>
  </>
}
function About() { return <><Intro eyebrow="About Pinnacle" title="A thoughtful partner for decisions that matter." description={company.intro}/><section className="about-body wrap"><div className="about-image"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=80" alt="Colleagues collaborating around a table"/><span>Listen closely. Think clearly. Move forward.</span></div><div className="about-copy"><span className="eyebrow">Our perspective</span><h2>Advisory grounded in <em>understanding.</em></h2><p>We believe sound decisions start with a clear view of the situation. Our approach is collaborative: we take time to understand what you are trying to achieve, review the context you provide, and help identify useful options and next steps.</p><p>Our work is shaped by the needs of each engagement. Scope, deliverables, and timelines are agreed with you before work begins.</p><ButtonLink to="/contact" outline>Start a conversation</ButtonLink></div></section><section className="values-section"><div className="wrap"><span className="eyebrow">How we work</span><h2>Principles that guide <em>every conversation.</em></h2><div className="values-grid">{['Listen first|Begin with your objectives and the realities around them.','Think carefully|Approach questions with structure, context, and an open mind.','Act practically|Focus on clear recommendations and useful next steps.'].map((v, i) => <div key={v}><span>0{i + 1}</span><h3>{v.split('|')[0]}</h3><p>{v.split('|')[1]}</p></div>)}</div></div></section></> }
function Services() {
  const icons = [BarChart3, Compass, BriefcaseBusiness, ShieldCheck, BarChart3]
  const reduceMotion = useReducedMotion()
  return <><Intro eyebrow="Our services" title="Structured support for important decisions." description="We bring together business intelligence, financial analysis, and technology. Engagement scope and deliverables are agreed together before work begins."/><Reveal className="service-detail-section wrap"><div className="service-detail-grid">{services.map((item, i) => {
    const Icon = icons[i]
    return <motion.article className="service-detail" key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.5, delay: i * 0.07 }}><div className="detail-icon"><Icon/></div><span className="eyebrow">Service {item.id}</span><h2>{item.title}</h2><p>{item.description}</p><h3>How we can help</h3><ul><li><Check/>Clarify the question and desired outcome</li><li><Check/>Review relevant information together</li><li><Check/>Agree practical next steps and scope</li></ul><Link className="text-link" to="/contact">Discuss this service <ArrowRight size={15}/></Link></motion.article>
  })}</div></Reveal><section className="cta-band"><div className="wrap cta-inner"><div><span className="eyebrow eyebrow-light">Have a question?</span><h2>Let's understand what<br/><em>you need.</em></h2></div><ButtonLink to="/contact">Make an enquiry</ButtonLink></div></section></>
}
function Industries() { return <><Intro eyebrow="Who we support" title="A perspective shaped around your context." description="We work with people and organisations seeking thoughtful support as they evaluate opportunities, investment questions, and important next steps."/><section className="industries-body wrap"><div><span className="eyebrow">A client-first approach</span><h2>Start with the challenge.<br/><em>Build from there.</em></h2></div><div><p>Every client arrives with a different set of objectives and circumstances. Rather than assume a one-size-fits-all answer, we begin by understanding the question you need to resolve and the information available to you.</p><p>We do not publish client names or sector credentials that have not been confirmed. If you are exploring an engagement, we welcome a direct conversation about fit and scope.</p><ButtonLink to="/contact" outline>Discuss your needs</ButtonLink></div></section><div className="industry-image wrap"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85" alt="Modern commercial buildings in an urban business district"/></div></> }
function EmptyPage({ insights = false }: { insights?: boolean }) { return <><Intro eyebrow={insights ? 'Insights & resources' : 'Projects & case studies'} title={insights ? 'Clear thinking for the questions ahead.' : 'The work starts with your question.'} description={insights ? 'We are preparing useful perspectives on planning, investment decisions, and advisory practice.' : 'We are not currently sharing named projects or case studies. We publish verified work only, with permission from the people and organisations involved.'}/><section className="projects-empty wrap"><div className="empty-symbol">{insights ? <BarChart3/> : <BriefcaseBusiness/>}</div><span className="eyebrow">{insights ? 'Resources' : 'An open invitation'}</span><h2>{insights ? 'New perspectives are in development.' : 'Have a decision to work through?'}</h2><p>{insights ? 'For a conversation tailored to your circumstances, please contact Pinnacle Empower Advisory directly.' : 'Tell us a little about the question you are facing. We can discuss whether our advisory approach may be useful and agree an appropriate scope.'}</p><ButtonLink to="/contact">{insights ? 'Contact the team' : 'Start a conversation'}</ButtonLink></section></> }
function Contact() {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string; fallbackHref?: string } | null>(null)
  const [sending, setSending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity() || sending) return
    const data = new FormData(form)
    const subject = 'New Website Enquiry — Pinnacle Empower Advisory'
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Telephone: ${data.get('phone')}`,
      `Organisation: ${data.get('organisation') || 'Not provided'}`,
      `Area of interest: ${data.get('interest') || 'General enquiry'}`,
      '',
      'Message:',
      data.get('message'),
    ].join('\n')
    const fallbackHref = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          organisation: data.get('organisation'),
          interest: data.get('interest') || 'General enquiry',
          message: data.get('message'),
          website: data.get('website'),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We could not deliver your message. Please try again.')
      form.reset()
      setStatus({ kind: 'success', text: 'Your message has been delivered to Pinnacle Empower Advisory. Thank you for getting in touch.' })
    } catch (submitError) {
      setStatus({
        kind: 'error',
        text: submitError instanceof Error ? submitError.message : 'We could not deliver your message. Please continue in your email app.',
        fallbackHref,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Intro eyebrow="Contact" title="Let's start with a conversation." description="Share the question or opportunity you are considering. We will be glad to hear from you." />
      <section className="contact-section wrap">
        <div className="contact-details">
          <span className="eyebrow">{company.contactName} · {company.contactRole}</span>
          <h2>We look forward<br />to <em>hearing from you.</em></h2>
          <a className="contact-email" href={`mailto:${company.email}`}><Mail />{company.email}</a>
          <a href={`tel:${company.phone.replaceAll(' ', '')}`}><Phone />{company.phone}</a>
          <a href={`tel:${company.additionalPhone.replaceAll(' ','')}`}><Phone />{company.additionalPhone}</a>
          <div className="address"><MapPin /><span>{company.address}<br />Kampala, Uganda</span></div>
          <p className="form-note">Messages are sent securely to the Pinnacle team. You can also email us directly using the address above.</p>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <div className="form-row">
            <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
            <label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
          </div>
          <div className="form-row">
            <label>Telephone<input type="tel" name="phone" autoComplete="tel" minLength={7} maxLength={25} placeholder="+256 …" required /></label>
            <label>Organisation <span>(optional)</span><input name="organisation" autoComplete="organization" maxLength={160} /></label>
          </div>
          <div className="form-row form-row-single">
            <label>Area of interest<select name="interest" defaultValue=""><option value="">Select an area</option>{services.map((service) => <option key={service.id}>{service.title}</option>)}<option>General enquiry</option></select></label>
          </div>
          <label>How can we help?<textarea name="message" rows={5} required minLength={10} maxLength={5000} /></label>
          <label className="contact-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <button className="button" type="submit" disabled={sending}>{sending ? 'Sending message…' : 'Send message'} <ArrowRight size={16} /></button>
          {status && (
            <div>
              <p className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.text}</p>
              {status.kind === 'error' && status.fallbackHref && <a className="contact-fallback-link" href={status.fallbackHref}><Mail size={15} />Continue in your email app</a>}
            </div>
          )}
        </form>
      </section>
    </>
  )
}
function Privacy() { return <><Intro eyebrow="Privacy policy" title="Your information, treated with care." description="This page outlines how information shared through this website is handled."/><article className="privacy-content wrap"><h2>Enquiries</h2><p>The contact form sends enquiries through the configured email provider. If direct delivery is unavailable, the form offers a prefilled email draft instead. The website does not retain contact form submissions in its database. Email delivery and retention are subject to the email provider's privacy practices.</p><h2>Information collected</h2><p>This website does not currently use analytics or advertising trackers. Hosting providers may process basic technical logs as part of delivering the site.</p><h2>External links and images</h2><p>Some page photography is loaded from Unsplash. Visiting this site may cause your browser to request image assets from that service. External links are governed by the privacy policies of their respective providers.</p><h2>Contact</h2><p>For questions about privacy or an enquiry, contact <a href={`mailto:${company.email}`}>{company.email}</a>.</p></article></> }
function NotFound() { return <Intro eyebrow="Page not found" title="This page isn't here." description="The link may have changed. Head back to the home page or contact our team."/> }
function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = {
      '/': ['Pinnacle Empower Advisory | Clarity for your next decision', company.intro],
      '/about': ['About | Pinnacle Empower Advisory', 'Learn about Pinnacle Empower Advisory and its thoughtful, collaborative approach to business and investment decisions.'],
      '/services': ['Advisory Services | Pinnacle Empower Advisory', 'Explore business and investment planning, opportunity assessment, and advisory decision support.'],
      '/industries': ['Who We Support | Pinnacle Empower Advisory', 'Learn how Pinnacle Empower Advisory begins with each client’s context, objectives, and decision needs.'],
      '/projects': ['Projects | Pinnacle Empower Advisory', 'Pinnacle Empower Advisory shares verified project work only, with permission from the people and organisations involved.'],
      '/insights': ['Insights | Pinnacle Empower Advisory', 'Perspectives and resources from Pinnacle Empower Advisory are in development.'],
      '/contact': ['Contact | Pinnacle Empower Advisory', 'Contact Pinnacle Empower Advisory in Kampala to discuss your objectives, opportunities, and next steps.'],
      '/privacy': ['Privacy Policy | Pinnacle Empower Advisory', 'Read how Pinnacle Empower Advisory handles information shared through this website.'],
    }[pathname] ?? ['Page Not Found | Pinnacle Empower Advisory', 'The requested page could not be found. Contact Pinnacle Empower Advisory or return to the home page.']
    document.title = page[0]
    document.querySelector('meta[name="description"]')?.setAttribute('content', page[1])
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', page[0])
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', page[1])
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
function Site() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()
  return <><RouteEffects/><Header/><motion.main key={pathname} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.38, ease: 'easeOut' }}><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/services" element={<Services/>}/><Route path="/industries" element={<Industries/>}/><Route path="/projects" element={<EmptyPage/>}/><Route path="/insights" element={<EmptyPage insights/>}/><Route path="/contact" element={<Contact/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="*" element={<NotFound/>}/></Routes></motion.main><Footer/><ChatAssistant/></>
}
export default function App() { return <BrowserRouter><Site/></BrowserRouter> }
