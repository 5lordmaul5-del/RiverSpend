'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'riverspend-cookie-preferences-v1';

const COPY = {
  it: {
    title: 'La tua privacy conta',
    body: 'RiverSpend usa strumenti tecnici necessari al funzionamento del sito. Con il tuo permesso possiamo anche usare strumenti facoltativi per statistiche e suggerimenti personalizzati. Puoi rifiutarli senza perdere la possibilità di navigare o registrarti.',
    necessary: 'Tecnici necessari',
    necessaryNote: 'Sempre attivi: accesso, sicurezza e funzioni richieste.',
    analytics: 'Statistiche',
    analyticsNote: 'Aiutano a capire come viene usato il sito.',
    ads: 'Personalizzazione e pubblicità',
    adsNote: 'Permettono suggerimenti e annunci più pertinenti.',
    accept: 'Accetta tutti',
    reject: 'Rifiuta i facoltativi',
    customize: 'Personalizza',
    save: 'Salva preferenze',
    close: 'Chiudi',
    settings: 'Privacy e cookie',
    policy: 'Informativa privacy',
    saved: 'Preferenze salvate su questo dispositivo.',
  },
  en: {
    title: 'Your privacy matters',
    body: 'RiverSpend uses technical tools needed to operate the site. With your permission, optional tools may also be used for analytics and personalised suggestions. You can reject them and still browse or register.',
    necessary: 'Strictly necessary',
    necessaryNote: 'Always active for sign-in, security and requested features.',
    analytics: 'Analytics',
    analyticsNote: 'Help us understand how the site is used.',
    ads: 'Personalisation and advertising',
    adsNote: 'Enable more relevant suggestions and ads.',
    accept: 'Accept all',
    reject: 'Reject optional',
    customize: 'Customise',
    save: 'Save preferences',
    close: 'Close',
    settings: 'Privacy & cookies',
    policy: 'Privacy notice',
    saved: 'Preferences saved on this device.',
  },
  es: {
    title: 'Tu privacidad importa',
    body: 'RiverSpend utiliza herramientas técnicas necesarias para el sitio. Con tu permiso, también puede usar herramientas opcionales para estadísticas y sugerencias personalizadas. Puedes rechazarlas y seguir navegando o registrarte.',
    necessary: 'Técnicas necesarias',
    necessaryNote: 'Siempre activas para acceso, seguridad y funciones solicitadas.',
    analytics: 'Estadísticas',
    analyticsNote: 'Nos ayudan a comprender el uso del sitio.',
    ads: 'Personalización y publicidad',
    adsNote: 'Permiten sugerencias y anuncios más relevantes.',
    accept: 'Aceptar todas',
    reject: 'Rechazar opcionales',
    customize: 'Personalizar',
    save: 'Guardar preferencias',
    close: 'Cerrar',
    settings: 'Privacidad y cookies',
    policy: 'Aviso de privacidad',
    saved: 'Preferencias guardadas en este dispositivo.',
  },
  fr: {
    title: 'Votre vie privée compte',
    body: 'RiverSpend utilise les outils techniques nécessaires au site. Avec votre accord, des outils facultatifs peuvent servir aux statistiques et aux suggestions personnalisées. Vous pouvez les refuser et continuer à naviguer ou à vous inscrire.',
    necessary: 'Outils nécessaires',
    necessaryNote: 'Toujours actifs pour la connexion, la sécurité et les fonctions demandées.',
    analytics: 'Statistiques',
    analyticsNote: 'Nous aident à comprendre l’utilisation du site.',
    ads: 'Personnalisation et publicité',
    adsNote: 'Permettent des suggestions et publicités plus pertinentes.',
    accept: 'Tout accepter',
    reject: 'Refuser les options',
    customize: 'Personnaliser',
    save: 'Enregistrer',
    close: 'Fermer',
    settings: 'Confidentialité et cookies',
    policy: 'Avis de confidentialité',
    saved: 'Préférences enregistrées sur cet appareil.',
  },
  de: {
    title: 'Ihre Privatsphäre ist wichtig',
    body: 'RiverSpend verwendet technisch notwendige Funktionen. Mit Ihrer Zustimmung können optionale Tools für Statistiken und personalisierte Vorschläge eingesetzt werden. Sie können diese ablehnen und die Website weiterhin nutzen oder sich registrieren.',
    necessary: 'Notwendige Funktionen',
    necessaryNote: 'Immer aktiv für Anmeldung, Sicherheit und angeforderte Funktionen.',
    analytics: 'Statistiken',
    analyticsNote: 'Helfen uns, die Nutzung der Website zu verstehen.',
    ads: 'Personalisierung und Werbung',
    adsNote: 'Ermöglichen passendere Vorschläge und Werbung.',
    accept: 'Alle akzeptieren',
    reject: 'Optionale ablehnen',
    customize: 'Anpassen',
    save: 'Einstellungen speichern',
    close: 'Schließen',
    settings: 'Datenschutz und Cookies',
    policy: 'Datenschutzhinweis',
    saved: 'Einstellungen auf diesem Gerät gespeichert.',
  },
  pt: {
    title: 'A sua privacidade importa',
    body: 'RiverSpend utiliza ferramentas técnicas necessárias. Com a sua autorização, ferramentas opcionais podem ser usadas para estatísticas e sugestões personalizadas. Pode recusá-las e continuar a navegar ou a registar-se.',
    necessary: 'Essenciais',
    necessaryNote: 'Sempre ativas para acesso, segurança e funções solicitadas.',
    analytics: 'Estatísticas',
    analyticsNote: 'Ajudam a compreender a utilização do site.',
    ads: 'Personalização e publicidade',
    adsNote: 'Permitem sugestões e anúncios mais relevantes.',
    accept: 'Aceitar tudo',
    reject: 'Rejeitar opcionais',
    customize: 'Personalizar',
    save: 'Guardar preferências',
    close: 'Fechar',
    settings: 'Privacidade e cookies',
    policy: 'Aviso de privacidade',
    saved: 'Preferências guardadas neste dispositivo.',
  },
  zh: {
    title: '您的隐私很重要',
    body: 'RiverSpend 使用网站运行所必需的技术工具。经您同意，我们也可能使用可选工具进行统计和个性化推荐。您可以拒绝这些工具，仍然浏览网站或注册。',
    necessary: '必要功能',
    necessaryNote: '用于登录、安全和您请求的功能，始终启用。',
    analytics: '统计',
    analyticsNote: '帮助我们了解网站的使用情况。',
    ads: '个性化和广告',
    adsNote: '提供更相关的推荐和广告。',
    accept: '全部接受',
    reject: '拒绝可选项',
    customize: '自定义',
    save: '保存偏好',
    close: '关闭',
    settings: '隐私与 Cookie',
    policy: '隐私声明',
    saved: '偏好已保存在此设备。',
  },
  hi: {
    title: 'आपकी गोपनीयता महत्वपूर्ण है',
    body: 'RiverSpend साइट चलाने के लिए आवश्यक तकनीकी साधनों का उपयोग करता है। आपकी अनुमति से वैकल्पिक साधनों का उपयोग आँकड़ों और व्यक्तिगत सुझावों के लिए किया जा सकता है। आप इन्हें अस्वीकार करके भी साइट ब्राउज़ या पंजीकरण कर सकते हैं।',
    necessary: 'आवश्यक',
    necessaryNote: 'लॉगिन, सुरक्षा और अनुरोधित सुविधाओं के लिए हमेशा सक्रिय।',
    analytics: 'आँकड़े',
    analyticsNote: 'साइट के उपयोग को समझने में मदद करते हैं।',
    ads: 'व्यक्तिकरण और विज्ञापन',
    adsNote: 'अधिक प्रासंगिक सुझाव और विज्ञापन देते हैं।',
    accept: 'सभी स्वीकार करें',
    reject: 'वैकल्पिक अस्वीकार करें',
    customize: 'अनुकूलित करें',
    save: 'प्राथमिकताएँ सहेजें',
    close: 'बंद करें',
    settings: 'गोपनीयता और कुकीज़',
    policy: 'गोपनीयता सूचना',
    saved: 'प्राथमिकताएँ इस डिवाइस पर सहेजी गईं।',
  },
  ar: {
    title: 'خصوصيتك مهمة',
    body: 'يستخدم RiverSpend الأدوات التقنية اللازمة لتشغيل الموقع. وبموافقتك، يمكن استخدام أدوات اختيارية للإحصاءات والاقتراحات المخصصة. يمكنك رفضها ومواصلة التصفح أو التسجيل.',
    necessary: 'ضرورية',
    necessaryNote: 'مفعّلة دائمًا لتسجيل الدخول والأمان والميزات المطلوبة.',
    analytics: 'الإحصاءات',
    analyticsNote: 'تساعدنا على فهم كيفية استخدام الموقع.',
    ads: 'التخصيص والإعلانات',
    adsNote: 'تتيح اقتراحات وإعلانات أكثر ملاءمة.',
    accept: 'قبول الكل',
    reject: 'رفض الاختيارية',
    customize: 'تخصيص',
    save: 'حفظ التفضيلات',
    close: 'إغلاق',
    settings: 'الخصوصية وملفات تعريف الارتباط',
    policy: 'إشعار الخصوصية',
    saved: 'تم حفظ التفضيلات على هذا الجهاز.',
  },
  sw: {
    title: 'Faragha yako ni muhimu',
    body: 'RiverSpend hutumia zana za kiufundi zinazohitajika kuendesha tovuti. Kwa ruhusa yako, zana za hiari zinaweza kutumika kwa takwimu na mapendekezo binafsi. Unaweza kuzikataa na bado kuvinjari au kujisajili.',
    necessary: 'Zinazohitajika',
    necessaryNote: 'Huwashwa kila wakati kwa kuingia, usalama na vipengele ulivyoomba.',
    analytics: 'Takwimu',
    analyticsNote: 'Hutusaidia kuelewa matumizi ya tovuti.',
    ads: 'Mapendeleo na matangazo',
    adsNote: 'Huwezesha mapendekezo na matangazo yanayokufaa zaidi.',
    accept: 'Kubali zote',
    reject: 'Kataa za hiari',
    customize: 'Badilisha',
    save: 'Hifadhi mapendeleo',
    close: 'Funga',
    settings: 'Faragha na vidakuzi',
    policy: 'Taarifa ya faragha',
    saved: 'Mapendeleo yamehifadhiwa kwenye kifaa hiki.',
  },
};

function getLanguage() {
  if (typeof window === 'undefined') return 'it';
  let saved = '';
  try { saved = localStorage.getItem('riverspend-language') || ''; } catch {}
  const browser = (saved || document.documentElement.lang || navigator.language || 'en').toLowerCase().split('-')[0];
  return COPY[browser] ? browser : 'en';
}

function readPreferences() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function savePreferences(preferences) {
  const record = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    personalisedAds: Boolean(preferences.personalisedAds),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent('riverspend:cookie-preferences-change', { detail: record }));
  } catch {}
  return record;
}

export default function CookieConsent() {
  const [language, setLanguage] = useState('it');
  const [preferences, setPreferences] = useState(null);
  const [visible, setVisible] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personalisedAds, setPersonalisedAds] = useState(false);

  useEffect(() => {
    const updateLanguage = () => setLanguage(getLanguage());
    updateLanguage();
    const current = readPreferences();
    if (current) {
      setPreferences(current);
      setAnalytics(Boolean(current.analytics));
      setPersonalisedAds(Boolean(current.personalisedAds));
    } else {
      setVisible(true);
    }
    const onLanguageChange = () => updateLanguage();
    window.addEventListener('riverspend:language-change', onLanguageChange);
    return () => window.removeEventListener('riverspend:language-change', onLanguageChange);
  }, []);

  const t = COPY[language] || COPY.en;

  function chooseAll() {
    const next = savePreferences({ analytics: true, personalisedAds: true });
    setPreferences(next);
    setAnalytics(true);
    setPersonalisedAds(true);
    setVisible(false);
    setCustomising(false);
  }

  function rejectOptional() {
    const next = savePreferences({ analytics: false, personalisedAds: false });
    setPreferences(next);
    setAnalytics(false);
    setPersonalisedAds(false);
    setVisible(false);
    setCustomising(false);
  }

  function saveCustom() {
    const next = savePreferences({ analytics, personalisedAds });
    setPreferences(next);
    setVisible(false);
    setCustomising(false);
  }

  function openSettings() {
    setAnalytics(Boolean(preferences?.analytics));
    setPersonalisedAds(Boolean(preferences?.personalisedAds));
    setCustomising(true);
    setVisible(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        aria-label={t.settings}
        style={{ position: 'fixed', zIndex: 9997, left: 12, bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))', border: '1px solid #b7dcd7', borderRadius: 999, padding: '9px 13px', background: '#fffdf8', color: '#155c60', fontSize: 12, fontWeight: 700, boxShadow: '0 3px 14px #12343a18', cursor: 'pointer' }}
      >
        {t.settings}
      </button>

      {visible && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12, background: 'rgba(10,28,32,.45)' }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="rs-cookie-title"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{ width: 'min(100%, 760px)', maxHeight: '88vh', overflowY: 'auto', background: '#fffdf8', color: '#183c40', border: '1px solid #cde6e1', borderRadius: 20, padding: 'clamp(18px, 4vw, 28px)', boxShadow: '0 20px 70px #06192340', fontFamily: 'Arial, sans-serif' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
              <div>
                <div style={{ color: '#168f91', fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>RIVERSPEND · PRIVACY</div>
                <h2 id="rs-cookie-title" style={{ fontSize: 'clamp(22px, 4vw, 29px)', lineHeight: 1.15, margin: '8px 0 10px' }}>{t.title}</h2>
              </div>
              {preferences && <button type="button" onClick={() => setVisible(false)} aria-label={t.close} style={{ border: '1px solid #d5e7e3', borderRadius: 10, background: '#fff', color: '#24474b', padding: '7px 10px', cursor: 'pointer' }}>×</button>}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>{t.body}</p>
            {customising && (
              <div style={{ display: 'grid', gap: 10, margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, border: '1px solid #d7e9e5', borderRadius: 12 }}>
                  <div><strong>{t.necessary}</strong><div style={{ fontSize: 12, color: '#587174', marginTop: 4 }}>{t.necessaryNote}</div></div>
                  <input aria-label={t.necessary} type="checkbox" checked disabled style={{ width: 20, height: 20, accentColor: '#168f91', flexShrink: 0 }} />
                </div>
                <label style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, border: '1px solid #d7e9e5', borderRadius: 12, cursor: 'pointer' }}>
                  <span><strong>{t.analytics}</strong><span style={{ display: 'block', fontSize: 12, color: '#587174', marginTop: 4 }}>{t.analyticsNote}</span></span>
                  <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#168f91', flexShrink: 0 }} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, border: '1px solid #d7e9e5', borderRadius: 12, cursor: 'pointer' }}>
                  <span><strong>{t.ads}</strong><span style={{ display: 'block', fontSize: 12, color: '#587174', marginTop: 4 }}>{t.adsNote}</span></span>
                  <input type="checkbox" checked={personalisedAds} onChange={e => setPersonalisedAds(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#168f91', flexShrink: 0 }} />
                </label>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              <button type="button" onClick={chooseAll} style={{ flex: '1 1 145px', minHeight: 44, border: '1px solid #168f91', borderRadius: 11, background: '#168f91', color: '#fff', fontWeight: 800, padding: '10px 14px', cursor: 'pointer' }}>{t.accept}</button>
              <button type="button" onClick={rejectOptional} style={{ flex: '1 1 145px', minHeight: 44, border: '1px solid #b9d7d2', borderRadius: 11, background: '#fff', color: '#184b4e', fontWeight: 700, padding: '10px 14px', cursor: 'pointer' }}>{t.reject}</button>
              {customising
                ? <button type="button" onClick={saveCustom} style={{ flex: '1 1 145px', minHeight: 44, border: '1px solid #d8c49b', borderRadius: 11, background: '#fff7e6', color: '#694d12', fontWeight: 700, padding: '10px 14px', cursor: 'pointer' }}>{t.save}</button>
                : <button type="button" onClick={() => setCustomising(true)} style={{ flex: '1 1 145px', minHeight: 44, border: '1px solid #d8c49b', borderRadius: 11, background: '#fff7e6', color: '#694d12', fontWeight: 700, padding: '10px 14px', cursor: 'pointer' }}>{t.customize}</button>}
            </div>
            <p style={{ fontSize: 12, color: '#587174', margin: '14px 0 0', lineHeight: 1.5 }}>
              {t.policy}: <a href="/tutela#privacy" style={{ color: '#087f83', fontWeight: 700 }}>RiverSpend</a>. {t.saved}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
