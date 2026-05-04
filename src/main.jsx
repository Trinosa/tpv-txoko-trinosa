
import React,{useState,useMemo}from'react';
import{createRoot}from'react-dom/client';
import{QRCodeCanvas}from'qrcode.react';

const EMPLEADOS=[
"Manuelina Ramires","Jesus del Río","Alvaro Sanz","Javier Cuesta","Gonzalo García",
"Carolina Cano","Patricia Garcías","Isaac Garcías","Maria Nieto","Carlos Ramos",
"Alfonso Castillo","Alma Plana","Marcos Jimenez","Javier Rubio"
];

const PRODUCTOS=[
{id:"cerveza",nombre:"Cerveza",precio:0.6,stock:48},
{id:"agua",nombre:"Agua",precio:0.2,stock:48},
{id:"cafe",nombre:"Café",precio:0.2,stock:200}
];

function App(){
 const [empleado,setEmpleado]=useState(EMPLEADOS[0]);
 const [externo,setExterno]=useState("");
 const [consumos,setConsumos]=useState([]);
 const [pagos,setPagos]=useState([]);
 const [qr,setQr]=useState(null);

 const persona=empleado==="Externo"?(externo||"Externo"):empleado;

 const resumenPersonas=useMemo(()=>{
  const map={};
  consumos.forEach(c=>{
    map[c.persona]=(map[c.persona]||0)+c.total;
  });
  pagos.forEach(p=>{
    map[p.persona]=(map[p.persona]||0)-p.total;
  });
  return Object.entries(map).map(([k,v])=>({persona:k,total:v}));
 },[consumos,pagos]);

 const resumenProductos=useMemo(()=>{
  const map={};
  PRODUCTOS.forEach(p=>map[p.id]={...p,consumido:0});
  consumos.forEach(c=>{
    c.items.forEach(i=>{
      map[i.id].consumido+=i.cantidad;
    });
  });
  return Object.values(map).map(p=>({
    ...p,
    restante:p.stock-p.consumido
  }));
 },[consumos]);

 return <div>
 <h1>TPV TRINOSA</h1>

 <select onChange={e=>setEmpleado(e.target.value)}>
 {EMPLEADOS.map(e=><option key={e}>{e}</option>)}
 <option>Externo</option>
 </select>

 {empleado==="Externo"&&<input onChange={e=>setExterno(e.target.value)} placeholder="Nombre externo"/>}

 <h2>Total por trabajador</h2>
 {resumenPersonas.map(p=><div key={p.persona}>{p.persona}: {p.total.toFixed(2)}€</div>)}

 <h2>Stock productos</h2>
 {resumenProductos.map(p=><div key={p.id}>{p.nombre}: {p.restante} uds</div>)}

 {qr&&<QRCodeCanvas value="https://revolut.me/tuusuario"/>}

 </div>
}

createRoot(document.getElementById('root')).render(<App/>)
