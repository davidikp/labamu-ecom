import{i as e,n as t,t as n}from"./jsx-runtime-Cltr0gcK.js";import{t as r}from"./useTranslation-DVzcVVDK.js";import{a as i,m as a,n as o,r as s,t as c}from"./index-BU-qR2ay.js";import{t as l}from"./Dropdown-BlDu4j07.js";var u=e(t(),1),d=n(),f=[{id:`barger`,industries:[`hospitality`],preview:`/assets/templates/barger/barger.png`},{id:`napoli`,industries:[`hospitality`],preview:`/assets/templates/napoli/napoli.png`},{id:`xinear`,industries:[`beauty_service`,`retail`,`retail_service`,`tech`],preview:`/assets/templates/xinear/xinear.png`},{id:`houzez`,industries:[`production`,`prof_services`,`tech`,`real_estate`,`nonprofit`],preview:`/assets/templates/houzez/assets/houzez.png`},{id:`dekor`,industries:[`retail`,`production`,`retail_service`,`construction`,`other`],preview:`/assets/templates/dekor/dekor.png`},{id:`medic`,industries:[`healthcare`,`services`],preview:`/assets/templates/medic/medic.png`},{id:`photostoodio`,industries:[`services`,`prof_services`,`tech`,`retail_service`,`healthcare`,`nonprofit`],preview:`/assets/templates/photostoodio/photostoodio.png`},{id:`local`,industries:[`retail`,`production`,`construction`,`real_estate`,`other`],preview:`/assets/templates/local/local.png`}];function p(){let{t:e}=r(),{companyData:t,isLoading:n}=c(),[p,m]=(0,u.useState)(`fnb`);(0,u.useEffect)(()=>{t?.industry&&m(t.industry)},[t,n]);let h=Object.entries(s).map(([t,n])=>({id:t,label:e(n)})),g=(0,u.useMemo)(()=>{let e=o[p]??`other`;return[...f].sort((t,n)=>{let r=t.industries.includes(e),i=n.industries.includes(e);return r&&!i?-1:!r&&i?1:0})},[p]),_=a();function v(e){e===`houzez`&&window.open(`/templates-preview/${e}`,`_blank`)}function y(t){t===`houzez`?_(`/templates-edit/${t}`):alert(e(`website:studio.editorComingSoon`))}return n||!t?(0,d.jsx)(`div`,{style:{height:`calc(100vh - 56px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:`#FFFFFF`},children:(0,d.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,d.jsx)(`div`,{style:{width:`40px`,height:`40px`,border:`3px solid #F3F4F6`,borderTopColor:`#006BFF`,borderRadius:`50%`,animation:`spin 1s linear infinite`,margin:`0 auto 16px`}}),(0,d.jsx)(`p`,{style:{color:`#6B7280`,fontSize:`14px`,fontFamily:`'Lato', sans-serif`,fontWeight:500},children:e(`dashboard:profile.loading`)||`Loading business profile...`}),(0,d.jsx)(`style`,{children:`@keyframes spin { to { transform: rotate(360deg); } }`})]})}):(0,d.jsxs)(`div`,{style:{background:`#FFFFFF`,minHeight:`100vh`,fontFamily:`'Lato', sans-serif`},children:[(0,d.jsx)(`style`,{children:`
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
          transition: all 0.5s ease-in-out;
        }

        .template-card-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .template-card {
           position: relative;
           border-radius: 16px;
           overflow: hidden;
           border: 1px solid #F3F4F6;
           transition: all 0.3s ease;
           cursor: pointer;
           background: #F9FAFB;
           z-index: 1;
        }

        .template-card:hover {
           transform: translateY(-4px);
           border-color: #006BFF;
           box-shadow: 0 12px 24px rgba(0, 107, 255, 0.12);
        }

        .template-overlay {
           position: absolute;
           inset: 0;
           background: rgba(0, 0, 0, 0.5);
           opacity: 0;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           gap: 16px;
           transition: opacity 0.2s;
           backdrop-filter: blur(4px);
           padding: 24px;
           z-index: 20;
        }

        .template-card:hover .template-overlay {
           opacity: 1;
        }

        .badge-recommended {
           position: absolute;
           top: 16px;
           right: 16px;
           padding: 6px 14px;
           border-radius: 100px;
           font-size: 10px;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.8px;
           background: #006BFF; /* Labamu Blue */
           color: #FFFFFF; /* High-Contrast White */
           box-shadow: 0 4px 12px rgba(0, 107, 255, 0.25);
           display: flex;
           align-items: center;
           gap: 6px;
           z-index: 5;
           border: 1px solid rgba(255, 255, 255, 0.1); 
           transition: all 0.3s ease;
        }

        .template-img {
           width: 100%;
           aspect-ratio: 4/3;
           object-fit: cover;
           object-position: top center;
           display: block;
        }
      `}),(0,d.jsxs)(`main`,{style:{display:`flex`,flexDirection:`column`},children:[(0,d.jsxs)(`div`,{style:{padding:`80px 32px 48px`,textAlign:`center`,maxWidth:`1000px`,margin:`0 auto`},children:[(0,d.jsxs)(`h1`,{style:{fontSize:`40px`,fontWeight:800,color:`#111827`,margin:`0 0 16px 0`,letterSpacing:`-0.03em`},children:[e(`website:hero.titlePrefix`),` `,t.brandName]}),(0,d.jsx)(`p`,{style:{fontSize:`18px`,color:`#6B7280`,margin:`0 0 40px 0`,lineHeight:`28px`,maxWidth:`600px`,marginLeft:`auto`,marginRight:`auto`},children:e(`website:hero.subtitle`)}),(0,d.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:`4px`,background:`#FFFFFF`,padding:`16px 32px`,borderRadius:`100px`,border:`1px solid #E5E7EB`,boxShadow:`0 4px 12px rgba(0,0,0,0.03)`,transition:`all 0.3s`,fontSize:`16px`,color:`#4B5563`},children:[(0,d.jsx)(`span`,{style:{fontWeight:500},children:e(`website:hero.filterLabel`)}),(0,d.jsx)(l,{variant:`seamless`,options:h,selected:p,onSelect:m,width:`auto`})]})]}),(0,d.jsx)(`div`,{style:{maxWidth:`1200px`,margin:`0 auto`,width:`100%`,padding:`0 32px`},children:(0,d.jsx)(`h2`,{style:{fontSize:`20px`,fontWeight:700,color:`#111827`,margin:`0 0 32px 0`},children:e(`dashboard:gallery.browse`)})}),(0,d.jsx)(`div`,{style:{padding:`0 32px 100px`,maxWidth:`1200px`,margin:`0 auto`,width:`100%`},children:(0,d.jsx)(`div`,{className:`template-grid`,children:g.map(t=>{let n=o[p]??`other`,r=t.industries.includes(n);return(0,d.jsxs)(`div`,{className:`template-card-container`,children:[(0,d.jsxs)(`div`,{className:`template-card`,children:[(0,d.jsx)(`img`,{src:t.preview,className:`template-img`,alt:t.id}),r&&(0,d.jsxs)(`div`,{className:`badge-recommended`,children:[(0,d.jsx)(`span`,{style:{fontSize:`13px`},children:`👍`}),(0,d.jsx)(`span`,{children:e(`website:gallery.recommended`)})]}),(0,d.jsxs)(`div`,{className:`template-overlay`,children:[(0,d.jsx)(i,{variant:`secondary`,width:`180px`,onClick:e=>{e.stopPropagation(),v(t.id)},style:{padding:`12px 24px`,fontSize:`14px`},children:e(`website:gallery.preview`)}),(0,d.jsx)(i,{variant:`primary`,width:`180px`,onClick:e=>{e.stopPropagation(),y(t.id)},style:{padding:`12px 24px`,fontSize:`14px`},children:e(`website:gallery.edit`)})]})]}),(0,d.jsxs)(`div`,{style:{padding:`0 4px`},children:[(0,d.jsx)(`h3`,{style:{margin:`0 0 4px 0`,fontSize:`18px`,fontWeight:700,color:`#111827`},children:e(`website:gallery.templates.${t.id}.title`)}),(0,d.jsx)(`p`,{style:{margin:0,fontSize:`14px`,color:`#6B7280`,lineHeight:`20px`,display:`-webkit-box`,WebkitLineClamp:2,WebkitBoxOrient:`vertical`,overflow:`hidden`,height:`40px`},children:e(`website:gallery.templates.${t.id}.desc`)})]})]},t.id)})})})]})]})}export{p as default};