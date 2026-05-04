import React, { useMemo, useState } from "react";

import { createRoot } from "react-dom/client";

import {

  Coffee, Beer, Wine, GlassWater, Cookie,

  Plus, Minus, Trash2, CheckCircle2,

  UserRound, ReceiptText, Search, Utensils,

  WalletCards, QrCode, AlertTriangle

} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";

import "./styles.css";

/* =========================

   👥 TRABAJADORES (tus nombres)

========================= */

const EMPLEADOS = [

  "Manuel Ramírez",

  "Manuelina Ramires",

  "Jesús del Río",

  "Álvaro Sanz",

  "Javier Cuesta",

  "Gonzalo García",

  "Carolina Cano",

  "Patricia Garcías",

  "Isaac Garcías",

  "María Nieto",

  "Carlos Ramos",

  "Alfonso Castillo",

  "Alma Plana",

  "Marcos Jiménez",

  "Javier Rubio"

];

/* =========================

   🍺 PRODUCTOS + STOCK

   stockInicial = unidades disponibles

   lowStock = umbral de aviso

========================= */

const PRODUCTOS = [

  { id: "agua", nombre: "Agua", precio: 0.2, categoria: "Frías", Icon: GlassWater, stockInicial: 48, lowStock: 5 },

  { id: "refresco", nombre: "Refresco", precio: 0.5, categoria: "Frías", Icon: GlassWater, stockInicial: 48, lowStock: 5 },

  { id: "zumo", nombre: "Zumo", precio: 0.5, categoria: "Frías", Icon: GlassWater, stockInicial: 24, lowStock: 5 },

  { id: "cafe", nombre: "Café", precio: 0.2, categoria: "Calientes", Icon: Coffee, stockInicial: 200, lowStock: 20 },

  { id: "cafe-leche", nombre: "Café con leche", precio: 0.4, categoria: "Calientes", Icon: Coffee, stockInicial: 200, lowStock: 20 },

  { id: "infusion", nombre: "Infusión", precio: 0.2, categoria: "Calientes", Icon: Coffee, stockInicial: 50, lowStock: 10 },

  { id: "cerveza", nombre: "Cerveza", precio: 0.6, categoria: "Bebidas", Icon: Beer, stockInicial: 48, lowStock: 6 },

  { id: "vino", nombre: "Vino", precio: 0.8, categoria: "Bebidas", Icon: Wine, stockInicial: 20, lowStock: 4 },

  { id: "snack", nombre: "Snack", precio: 0.5, categoria: "Snacks", Icon: Cookie, stockInicial: 40, lowStock: 6 },

  { id: "dulce", nombre: "Dulce", precio: 0.5, categoria: "Snacks", Icon: Cookie, stockInicial: 40, lowStock: 6 }

];

const eur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

function App() {

  const [empleado, setEmpleado] = useState(EMPLEADOS[0]);

  const [externo, setExterno] = useState("");

  const [buscar, setBuscar] = useState("");

  const [carrito, setCarrito] = useState({});

  const [consumos, setConsumos] = useState([]);

  const [pagos, setPagos] = useState([]);

  const [qr, setQr] = useState(null);

  const [revolut, setRevolut] = useState("https://revolut.me/tuusuario");

  const persona = empleado === "Externo"

    ? (externo.trim() ? `Externo - ${externo.trim()}` : "Externo")

    : empleado;

  /* ===== Agrupar productos para UI TPV ===== */

  const filtrados = PRODUCTOS.filter(p =>

    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||

    p.categoria.toLowerCase().includes(buscar.toLowerCase())

  );

  const grupos = useMemo(() => filtrados.reduce((acc, p) => {

    (acc[p.categoria] ??= []).push(p);

    return acc;

  }, {}), [filtrados]);

  /* ===== Carrito ===== */

  const items = Object.values(carrito);

  const totalActual = items.reduce((s, i) => s + i.cantidad * i.precio, 0);

  const add = (p) => {

    // bloqueo si no hay stock

    const consumido = consumos.reduce((s, c) =>

      s + c.items.filter(i => i.id === p.id).reduce((ss, i) => ss + i.cantidad, 0)

    , 0);

    const enCarrito = carrito[p.id]?.cantidad || 0;

    const restante = p.stockInicial - consumido - enCarrito;

    if (restante <= 0) return; // no deja añadir si no hay

    setCarrito(v => ({

      ...v,

      [p.id]: { ...p, cantidad: (v[p.id]?.cantidad || 0) + 1 }

    }));

  };

  const menos = (id) => {

    setCarrito(v => {

      const c = v[id];

      if (!c) return v;

      if (c.cantidad <= 1) {

        const n = { ...v };

        delete n[id];

        return n;

      }

      return { ...v, [id]: { ...c, cantidad: c.cantidad - 1 } };

    });

  };

  const limpiar = () => setCarrito({});

  const registrar = () => {

    if (!items.length) return;

    if (empleado === "Externo" && !externo.trim()) {

      alert("Introduce el nombre del externo.");

      return;

    }

    const d = new Date();

    const hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    setConsumos(v => [{

      persona,

      items: items.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),

      total: totalActual,

      hora

    }, ...v]);

    limpiar();

    if (empleado === "Externo") setExterno("");

  };

  /* ===== Totales globales ===== */

  const totalConsumido = consumos.reduce((s, c) => s + c.total, 0);

  const totalPagado = pagos.reduce((s, p) => s + p.importe, 0);

  const totalPendiente = totalConsumido - totalPagado;

  /* ===== Resumen por persona ===== */

  const resumenPersonas = useMemo(() => {

    const map = {};

    consumos.forEach(c => {

      if (!map[c.persona]) map[c.persona] = { persona: c.persona, consumido: 0, pagado: 0 };

      map[c.persona].consumido += c.total;

    });

    pagos.forEach(p => {

      if (!map[p.persona]) map[p.persona] = { persona: p.persona, consumido: 0, pagado: 0 };

      map[p.persona].pagado += p.importe;

    });

    return Object.values(map).map(x => ({

      ...x,

      pendiente: Math.max(0, +(x.consumido - x.pagado).toFixed(2))

    })).sort((a, b) => b.pendiente - a.pendiente || b.consumido - a.consumido);

  }, [consumos, pagos]);

  const pendientes = resumenPersonas.filter(x => x.pendiente > 0);

  /* ===== Stock por producto ===== */

  const stockMap = useMemo(() => {

    const map = {};

    PRODUCTOS.forEach(p => map[p.id] = { ...p, consumido: 0 });

    consumos.forEach(c => {

      c.items.forEach(i => {

        if (map[i.id]) map[i.id].consumido += i.cantidad;

      });

    });

    return Object.values(map).map(p => {

      const restante = p.stockInicial - p.consumido;

      return { ...p, restante: Math.max(0, restante) };

    });

  }, [consumos]);

  const saldar = (persona, importe) => {

    setPagos(v => [{ persona, importe }, ...v]);

    setQr(null);

  };

  return (

    <div className="page">

      <header className="header">

        <div className="brand">

          <div className="logo"><Utensils size={26} /></div>

          <div>

            <h1>TPV Txoko TRINOSA</h1>

            <p>TPV visual · totales por persona · stock · QR Revolut</p>

          </div>

        </div>

        <div className="stats">

          <div><span>Consumido</span><b>{eur(totalConsumido)}</b></div>

          <div><span>Pagado</span><b>{eur(totalPagado)}</b></div>

          <div className="pending"><span>Pendiente</span><b>{eur(totalPendiente)}</b></div>

        </div>

      </header>

      <main className="layout">

        {/* ===== IZQUIERDA: TPV ===== */}

        <section className="left">

          <div className="toolbar">

            <div className="field">

              <Search size={18} />

              <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar producto..." />

            </div>

            <div className="person">

              <div className="field">

                <UserRound size={18} />

                <select value={empleado} onChange={e => setEmpleado(e.target.value)}>

                  {EMPLEADOS.map(e => <option key={e}>{e}</option>)}

                  <option>Externo</option>

                </select>

              </div>

              {empleado === "Externo" && (

                <div className="field">

                  <input value={externo} onChange={e => setExterno(e.target.value)} placeholder="Nombre del externo" />

                </div>

              )}

            </div>

          </div>

          {Object.entries(grupos).map(([cat, ps]) => (

            <div className="grupo" key={cat}>

              <h2>{cat}</h2>

              <div className="grid">

                {ps.map(p => {

                  const Icon = p.Icon;

                  const stock = stockMap.find(x => x.id === p.id);

                  const sinStock = stock?.restante <= 0;

                  const bajo = stock?.restante <= p.lowStock;

                  return (

                    <button

                      key={p.id}

                      className={`card ${sinStock ? "disabled" : ""} ${bajo ? "low" : ""}`}

                      onClick={() => add(p)}

                      disabled={sinStock}

                    >

                      <div className="top">

                        <Icon size={22} />

                        <Plus size={20} />

                      </div>

                      <h3>{p.nombre}</h3>

                      <b>{eur(p.precio)}</b>

                      <small>Restante: {stock?.restante}</small>

                      {bajo && !sinStock && <div className="warn"><AlertTriangle size={14}/> Bajo</div>}

                      {sinStock && <div className="warn red">Sin stock</div>}

                    </button>

                  );

                })}

              </div>

            </div>

          ))}

        </section>

        {/* ===== DERECHA ===== */}

        <aside className="right">

          {/* Carrito */}

          <section className="box">

            <div className="title">

              <h2>Consumo actual</h2>

              <ReceiptText size={22}/>

            </div>

            <p>{persona}</p>

            {!items.length ? (

              <div className="empty">Añade productos</div>

            ) : items.map(i => (

              <div className="line" key={i.id}>

                <div>

                  <b>{i.nombre}</b>

                  <span>{i.cantidad} x {eur(i.precio)}</span>

                </div>

                <div>

                  <button onClick={() => menos(i.id)}><Minus size={16}/></button>

                  <b>{i.cantidad}</b>

                  <button onClick={() => add(i)}><Plus size={16}/></button>

                </div>

              </div>

            ))}

            <div className="total">

              <span>Total</span>

              <b>{eur(totalActual)}</b>

            </div>

            <div className="actions">

              <button onClick={limpiar} disabled={!items.length}><Trash2 size={16}/>Limpiar</button>

              <button className="ok" onClick={registrar} disabled={!items.length}><CheckCircle2 size={16}/>Registrar</button>

            </div>

          </section>

          {/* Saldos */}

          <section className="box">

            <div className="title">

              <h2>Saldos pendientes</h2>

              <WalletCards size={22}/>

            </div>

            {!pendientes.length ? (

              <div className="empty">Sin pendientes</div>

            ) : pendientes.map(s => (

              <div className="saldo" key={s.persona}>

                <div>

                  <b>{s.persona}</b>

                  <span>{eur(s.pendiente)}</span>

                </div>

                <button onClick={() => setQr({ persona: s.persona, saldo: s.pendiente })}>

                  <QrCode size={16}/> Pagar / QR

                </button>

              </div>

            ))}

          </section>

          {/* Totales por persona */}

          <section className="box">

            <h2>Total por trabajador</h2>

            {resumenPersonas.map(r => (

              <div className="row" key={r.persona}>

                <b>{r.persona}</b>

                <span>Consumido: {eur(r.consumido)}</span>

                <span>Pendiente: {eur(r.pendiente)}</span>

              </div>

            ))}

          </section>

        </aside>

      </main>

      {/* Modal QR */}

      {qr && (

        <div className="modal" onClick={() => setQr(null)}>

          <div className="panel" onClick={e => e.stopPropagation()}>

            <h2>Pago Revolut</h2>

            <p>{qr.persona}</p>

            <strong>{eur(qr.saldo)}</strong>

            <QRCodeCanvas value={revolut} size={200}/>

            <div className="actions">

              <button onClick={() => setQr(null)}>Cancelar</button>

              <button className="ok" onClick={() => saldar(qr.persona, qr.saldo)}>Saldar</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

createRoot(document.getElementById("root")).render(<App />);
