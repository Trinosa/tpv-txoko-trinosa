
import React,{useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{Coffee,Beer,Wine,GlassWater,Cookie,Plus,Minus,Trash2,CheckCircle2,UserRound,Search,WalletCards,QrCode,Settings}from'lucide-react';
import{QRCodeCanvas}from'qrcode.react';
import './styles.css';

const EMPLEADOS=[
'María Nieto','Manuel Ramírez','Ricardo Miras','Javier Rubio','Javier Cuesta',
'Administración','Financiero','Comercial','Técnico','Dirección'
];

const PRODUCTOS=[
['agua','Agua',0.20,'Frías',GlassWater],['refresco','Refresco',0.50,'Frías',GlassWater],['zumo','Zumo',0.50,'Frías',GlassWater],
['cafe','Café',0.20,'Calientes',Coffee],['cafeleche','Café con leche',0.40,'Calientes',Coffee],['infusion','Infusión',0.20,'Calientes',Coffee],
['cerveza','Cerveza',0.60,'Bebidas',Beer],['vino','Vino',0.80,'Bebidas',Wine],
['snack','Snack',0.50,'Snacks',Cookie],['dulce','Dulce',0.50,'Snacks',Cookie]
].map(([id,nombre,precio,categoria,Icon])=>({id,nombre,precio,categoria,Icon}));

const eur=n=>`${n.toFixed(2).replace('.',',')} €`;

function App(){
 const [empleado,setEmpleado]=useState(EMPLEADOS[0]);
 const [externo,setExterno]=useState('');
 const [buscar,setBuscar]=useState('');
 const [carrito,setCarrito]=useState({});
 const [consumos,setConsumos]=useState([]);
 const [pagos,setPagos]=useState([]);
 const [qr,setQr]=useState(null);
 const [revolut,setRevolut]=useState('https://revolut.me/tuusuario');

 const persona=empleado==='Externo'?(externo.trim()?`Externo - ${externo.trim()}`:'Externo'):empleado;
 const filtrados=PRODUCTOS.filter(p=>p.nombre.toLowerCase().includes(buscar.toLowerCase())||p.categoria.toLowerCase().includes(buscar.toLowerCase()));
 const grupos=useMemo(()=>filtrados.reduce((a,p)=>{(a[p.categoria]??=[]).push(p);return a},{}),[filtrados]);
 const items=Object.values(carrito);
 const total=items.reduce((s,i)=>s+i.cantidad*i.precio,0);
 const consumido=consumos.reduce((s,c)=>s+c.total,0);
 const pagado=pagos.reduce((s,p)=>s+p.importe,0);
 const pendiente=consumido-pagado;

 const saldos=useMemo(()=>{
   const m={};
   consumos.forEach(c=>m[c.persona]=(m[c.persona]||0)+c.total);
   pagos.forEach(p=>m[p.persona]=(m[p.persona]||0)-p.importe);
   return Object.entries(m).map(([persona,saldo])=>({persona,saldo:Math.max(0,+saldo.toFixed(2))})).filter(x=>x.saldo>0).sort((a,b)=>b.saldo-a.saldo);
 },[consumos,pagos]);

 const add=p=>setCarrito(v=>({...v,[p.id]:{...p,cantidad:(v[p.id]?.cantidad||0)+1}}));
 const menos=id=>setCarrito(v=>{const c=v[id];if(!c)return v;if(c.cantidad<=1){const n={...v};delete n[id];return n}return {...v,[id]:{...c,cantidad:c.cantidad-1}}});
 const limpiar=()=>setCarrito({});
 const registrar=()=>{
   if(!items.length)return;
   if(empleado==='Externo'&&!externo.trim()){alert('Introduce el nombre del externo.');return;}
   const d=new Date(); const hora=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
   setConsumos(v=>[{persona,items:items.map(i=>({nombre:i.nombre,cantidad:i.cantidad,precio:i.precio})),total,hora},...v]);
   limpiar(); if(empleado==='Externo')setExterno('');
 };
 const saldar=(persona,importe)=>{const d=new Date(); const hora=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; setPagos(v=>[{persona,importe,hora},...v]);setQr(null);};

 return <div className='page'>
  <header><div><h1>TPV Txoko TRINOSA</h1><p>Consumos internos · saldos por persona · pago con QR Revolut</p></div><div className='stats'><div><span>Consumido</span><b>{eur(consumido)}</b></div><div className='orange'><span>Pendiente</span><b>{eur(pendiente)}</b></div></div></header>
  <main>
   <section className='left'>
    <div className='toolbar'>
     <div className='field'><Search size={18}/><input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder='Buscar producto'/></div>
     <div className='person'>
      <div className='field'><UserRound size={18}/><select value={empleado} onChange={e=>setEmpleado(e.target.value)}>{EMPLEADOS.map(x=><option key={x}>{x}</option>)}<option>Externo</option></select></div>
      {empleado==='Externo'&&<div className='field'><input value={externo} onChange={e=>setExterno(e.target.value)} placeholder='Nombre del externo'/></div>}
     </div>
    </div>
    {Object.entries(grupos).map(([cat,ps])=><div key={cat} className='grupo'><h2>{cat}</h2><div className='grid'>{ps.map(p=>{const I=p.Icon;return <button className='card' key={p.id} onClick={()=>add(p)}><div><I/><Plus/></div><h3>{p.nombre}</h3><b>{eur(p.precio)}</b></button>})}</div></div>)}
   </section>
   <aside>
    <section className='box'><h2>Consumo actual</h2><p>{persona}</p>{!items.length?<div className='empty'>Añade productos</div>:items.map(i=><div className='line' key={i.id}><div><b>{i.nombre}</b><span>{i.cantidad} x {eur(i.precio)}</span></div><div><button onClick={()=>menos(i.id)}><Minus size={16}/></button><b>{i.cantidad}</b><button onClick={()=>add(i)}><Plus size={16}/></button></div></div>)}<div className='total'><span>Total</span><b>{eur(total)}</b></div><div className='actions'><button onClick={limpiar} disabled={!items.length}><Trash2 size={16}/>Limpiar</button><button className='ok' onClick={registrar} disabled={!items.length}><CheckCircle2 size={16}/>Registrar</button></div></section>
    <section className='box'><h2><WalletCards size={20}/> Saldos</h2>{!saldos.length?<div className='empty'>Sin saldos pendientes</div>:saldos.map(s=><div className='saldo' key={s.persona}><div><b>{s.persona}</b><span>{eur(s.saldo)}</span></div><button onClick={()=>setQr(s)}><QrCode size={16}/>Pagar / saldar</button></div>)}</section>
    <section className='box'><h2><Settings size={20}/> Ajustes</h2><label>Enlace Revolut / Payment Link</label><input className='revolut' value={revolut} onChange={e=>setRevolut(e.target.value)}/><small>Usa tu enlace real de Revolut. El QR se genera con este enlace.</small></section>
    <section className='box'><h2>Últimos consumos</h2>{consumos.slice(0,5).map((c,i)=><div className='registro' key={i}><b>{c.persona}</b><span>{c.hora}</span><p>{c.items.map(x=>`${x.cantidad} ${x.nombre}`).join(' · ')}</p><strong>{eur(c.total)}</strong></div>)}</section>
   </aside>
  </main>
  {qr&&<div className='modal'><div className='panel'><h2>Pago Revolut</h2><h3>{qr.persona}</h3><strong>{eur(qr.saldo)}</strong><div className='qr'><QRCodeCanvas value={revolut} size={220}/></div><p>Escanear QR, pagar el importe pendiente y después marcar como saldado.</p><div className='actions'><button onClick={()=>setQr(null)}>Cancelar</button><button className='ok' onClick={()=>saldar(qr.persona,qr.saldo)}>Marcar saldado</button></div></div></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
