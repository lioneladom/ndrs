import React, { useState } from 'react';
import { Flame, Activity, ShieldAlert, Check, HelpCircle, ExternalLink, Droplet, UtensilsCrossed, Radio, Landmark, Compass, Eye, Volume2, Phone, ArrowRight } from 'lucide-react';

export default function ResourcesView() {
  const [checklist, setChecklist] = useState([
    { id: 1, title: '3-Day Water Supply', desc: 'At least 4 liters per person per day.', checked: false, icon: <Droplet size={18} /> },
    { id: 2, title: 'Non-Perishable Food', desc: 'Energy bars, canned goods, dried fruits.', checked: false, icon: <UtensilsCrossed size={18} /> },
    { id: 3, title: 'Power Bank & Radio', desc: 'To stay connected and hear official broadcasts.', checked: false, icon: <Radio size={18} /> },
    { id: 4, title: 'First Aid Kit', desc: 'Bandages, antiseptics, and essential meds.', checked: false, icon: <Activity size={18} /> },
    { id: 5, title: 'Whistle & Flashlight', desc: 'For signaling and visibility in low light.', checked: false, icon: <Volume2 size={18} /> },
    { id: 6, title: 'Identification & Cash', desc: 'Physical copies of IDs in waterproof bags.', checked: false, icon: <Landmark size={18} /> },
  ]);

  const [activeGuide, setActiveGuide] = useState(null);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedCount = checklist.filter(item => item.checked).length;

  const showGuide = (guideTitle, content) => {
    setActiveGuide({ title: guideTitle, content });
  };

  return (
    <div className="page-content">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="section-title">Resources &amp; Preparedness</h2>
        <p className="section-subtitle" style={{ marginTop: '8px' }}>
          Access expert-vetted guides, safety checklists, and essential contacts to keep you and your family safe during national emergencies.
        </p>
      </div>

      {/* Featured Flood Guide Banner */}
      <div className="guide-banner-card">
        <div className="guide-banner-img-container">
          <img src="/flood_warning.png" alt="Accra flood warning" className="guide-banner-img" />
          <div className="guide-banner-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)'
          }}></div>
          <span className="guide-banner-tag">Active Warning</span>
          <h3 className="guide-banner-title">What to do in a Flood</h3>
        </div>
        <div className="guide-banner-content">
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
            Essential steps for before, during, and after a flood event. Learn about sandbagging, electrical safety, and emergency evacuation routes in your district.
          </p>
          <button 
            className="guide-banner-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => showGuide('Flood Emergency Guide', [
              'BEFORE: Prepare sandbags, elevate electric appliances, pack emergency dry bags.',
              'DURING: Move immediately to higher ground. Avoid driving or walking through moving floodwaters.',
              'AFTER: Do not touch wet electrical gear. Boil tap water before consumption due to contamination risk.'
            ])}
          >
            Read full guide <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Other Guides list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="list-guide-item fire" onClick={() => showGuide('Fire Safety Guide', [
          'In case of fire, evacuate immediately. Do not collect personal belongings.',
          'Touch door handles with the back of your hand before opening. If hot, use another exit.',
          'Crawl low under smoke to find exit routes.'
        ])}>
          <div className="list-guide-icon-box">
            <Flame size={20} />
          </div>
          <div>
            <span className="list-guide-sub" style={{ color: '#b91c1c' }}>Fire Safety at Home</span>
            <div className="list-guide-title">Preventive measures and evacuation skills</div>
          </div>
        </div>

        <div className="list-guide-item seismic" onClick={() => showGuide('Seismic Awareness Guide', [
          'DROP: Get down on your hands and knees.',
          'COVER: Cover your head and neck under a sturdy table.',
          'HOLD ON: Stay in place until the shaking stops.'
        ])}>
          <div className="list-guide-icon-box">
            <Compass size={20} />
          </div>
          <div>
            <span className="list-guide-sub">Greater Accra Region</span>
            <div className="list-guide-title">Drop, Cover, and Hold On strategies</div>
          </div>
        </div>
      </div>

      {/* Emergency Kit Checklist */}
      <div className="white-card checklist-card">
        <div className="checklist-header">
          <div>
            <h3 className="checklist-title">Emergency Kit Checklist</h3>
            <span className="checklist-completed-label">Are you prepared for a 72-hour outage?</span>
          </div>
          <div className="checklist-status">
            <div className="checklist-ratio">{completedCount}/6</div>
            <span className="checklist-completed-label">COMPLETED</span>
          </div>
        </div>

        <div className="checklist-items">
          {checklist.map(item => (
            <div 
              key={item.id} 
              className={`checklist-row ${item.checked ? 'checked' : ''}`}
              onClick={() => toggleCheck(item.id)}
            >
              <div className="checklist-checkbox-col">
                <div className="mock-checkbox">
                  {item.checked && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="checklist-text">
                  <span className="checklist-item-title">{item.title}</span>
                  <span className="checklist-item-desc">{item.desc}</span>
                </div>
              </div>
              <div className="checklist-icon">{item.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* First Aid Guides */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>First Aid Guides</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="first-aid-item" onClick={() => showGuide('CPR Procedures', ['Verify responsiveness.', 'Call emergency services (112).', 'Perform chest compressions (100-120 per minute at 2 inches depth).'])}>
            <div className="first-aid-left">
              <Activity size={16} />
              <span>CPR Procedures</span>
            </div>
            <ExternalLink size={14} />
          </div>
          
          <div className="first-aid-item" onClick={() => showGuide('Bleeding Control', ['Apply direct pressure with a clean cloth.', 'Elevate the wound above heart level.', 'Apply dressing tightly to maintain pressure.'])}>
            <div className="first-aid-left">
              <ShieldAlert size={16} />
              <span>Bleeding Control</span>
            </div>
            <ExternalLink size={14} />
          </div>

          <div className="first-aid-item" onClick={() => showGuide('Heatstroke Recovery', ['Move the victim to a cool, shaded environment.', 'Apply cool, damp cloths to their skin.', 'Do not force liquids if they are unconscious.'])}>
            <div className="first-aid-left">
              <Activity size={16} />
              <span>Heatstroke Recovery</span>
            </div>
            <ExternalLink size={14} />
          </div>

          <div className="first-aid-item" onClick={() => showGuide('Fracture Stabilization', ['Do not attempt to realign the bone.', 'Immobilize the joint above and below the break.', 'Apply a cold pack wrap to reduce swelling.'])}>
            <div className="first-aid-left">
              <ShieldAlert size={16} />
              <span>Fracture Stabilization</span>
            </div>
            <ExternalLink size={14} />
          </div>
        </div>
      </div>

      {/* Pro Tip Callout Card */}
      <div className="callout-cyan">
        <strong>Pro Tip:</strong> Review your emergency plan with your household every six months to ensure everyone knows the primary evacuation route.
      </div>

      {/* Contacts Directory */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>Emergency Contacts Directory</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <a href="tel:0302222222" className="contact-item">
            <span className="contact-agency">NADMO HQ</span>
            <span className="contact-number">030 222 2222</span>
            <span className="contact-desc">National Disaster Management Organization</span>
          </a>

          <a href="tel:191" className="contact-item">
            <span className="contact-agency">POLICE EMERGENCY</span>
            <span className="contact-number">191 / 112</span>
            <span className="contact-desc">General Police Emergencies</span>
          </a>

          <a href="tel:192" className="contact-item">
            <span className="contact-agency">FIRE SERVICE</span>
            <span className="contact-number">192 / 112</span>
            <span className="contact-desc">Fire and Rescue Operations</span>
          </a>

          <a href="tel:193" className="contact-item">
            <span className="contact-agency">AMBULANCE SERVICE</span>
            <span className="contact-number">193 / 112</span>
            <span className="contact-desc">National Ambulance Service</span>
          </a>

        </div>
      </div>

      {/* Guide Detail Dialog Overlay */}
      {activeGuide && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="white-card" style={{ width: '100%', maxHeight: '80%', overflowY: 'auto' }}>
            <h3 className="section-title" style={{ fontSize: '18px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              {activeGuide.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
              {activeGuide.content.map((stepText, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', lineHeight: '1.4' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#dbeafe', color: '#083c82',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '11px', flexShrink: 0
                  }}>{idx + 1}</div>
                  <span>{stepText}</span>
                </div>
              ))}
            </div>

            <button 
              className="primary-pill-btn"
              onClick={() => setActiveGuide(null)}
              style={{ marginTop: '12px', padding: '10px' }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
