import React,{useState}from'react'
import{createRoot}from'react-dom/client'
import{QRCodeCanvas}from'qrcode.react'
import'./styles.css'

const EMPLEADOS=["Manuel Ramírez","Manuelina Ramires","Jesús del Río","Álvaro Sanz","Javier Cuesta","Gonzalo García","Carolina Cano","Patricia Garcías","Isaac Garcías","María Nieto","Carlos Ramos","Alfonso Castillo","Alma Plana","Marcos Jiménez","Javier Rubio"]

const PRODUCTOS=[{id:"cerveza",nombre:"Cerveza",precio:0.6},{id:"agua",nombre:"Agua",precio:0.2},{id:"cafe",nombre:"Café",precio:0.2}]

function App(){
const[empleado,setEmpleado]=useState(EMPLEADOS[0])
const[externo,setExterno]=useState("")
const[consumos,setConsumos]=useState([])
const[qr,setQr]=useState(null)

const persona=empleado==="Externo"?(externo||"Externo"):empleado

const add=(p)=>{
setConsumos([...consumos,{persona,total:p.precio}])
}

const totalPersona=consumos.filter(c=>c.persona===persona).reduce((s,c)=>s+c.total,0)

return<div className="page">
<h1>TPV TRINOSA</h1>

<select onChange={e=>setEmpleado(e.target.value)}>
{EMPLEADOS.map(e=><option key={e}>{e}</option>)}
<option>Externo</option>
</select>

{empleado==="Externo"&&<input onChange={e=>setExterno(e.target.value)} placeholder="Nombre"/>}

<div className="grid">
{PRODUCTOS.map(p=><div key={p.id} className="card" onClick={()=>add(p)}>
<h3>{p.nombre}</h3>
<b>{p.precio}€</b>
</div>)}
</div>

<div className="box">
<h2>Total {persona}</h2>
<b>{totalPersona.toFixed(2)}€</b>
<button onClick={()=>setQr(true)}>Pagar</button>
</div>

{qr&&<QRCodeCanvas value="https://revolut.me/tuusuario"/>}

</div>
}

createRoot(document.getElementById('root')).render(<App/>)
