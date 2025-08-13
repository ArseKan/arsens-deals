import React, { useEffect, useMemo, useState } from "react";

const BRAND = {
  name: "Arsen’s Deals",
  accent: "#1f4fd8" // Royal Blue
};

function Logo() {
  return (
    <div className="flex items-center gap-2" style={{fontFamily:"Inter, system-ui, Arial"}}>
      <div className="w-9 h-9" style={{background: BRAND.accent, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"12px", fontWeight:700}}>A</div>
      <div className="font-bold text-xl">{BRAND.name}</div>
    </div>
  );
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

const DEMO = [
  { id: "p1", title: "Wireless Earbuds", image: "https://via.placeholder.com/600x400", price: 9.99, shipping: 0.00 },
  { id: "p2", title: "Stainless Water Bottle", image: "https://via.placeholder.com/600x400", price: 8.49, shipping: 1.50 },
  { id: "p3", title: "USB-C Charger 20W", image: "https://via.placeholder.com/600x400", price: 6.99, shipping: 0.00 },
];

function formatEUR(n){return Intl.NumberFormat(undefined,{style:'currency',currency:'EUR'}).format(n)}

export default function App(){
  const [products, setProducts] = useLocalStorage("arsens_products", DEMO);
  const [cart, setCart] = useLocalStorage("arsens_cart", []);
  const [view, setView] = useState("store"); // store | admin | checkout

  const totals = useMemo(()=>{
    const items = cart.reduce((sum, it)=> sum + it.price, 0);
    const shipping = cart.reduce((sum, it)=> sum + (it.shipping||0), 0);
    const markup = cart.length * 0.50; // fixed €0.50 per product
    const total = +(items + shipping + markup).toFixed(2);
    return { items, shipping, markup, total };
  },[cart]);

  function addToCart(p){ setCart(prev=>[...prev, p]); }
  function removeFromCart(i){ setCart(prev=> prev.filter((_,idx)=> idx!==i)); }
  function clearCart(){ setCart([]);} 

  return (
    <div className="min-h-screen" style={{background:"#fff", color:"#111", fontFamily:"Inter, system-ui, Arial"}}>
      <header style={{position:"sticky", top:0, zIndex:20, background:"#fff", backdropFilter:"saturate(180%) blur(6px)", borderBottom:"1px solid #eee"}}>
        <div style={{maxWidth: "1100px", margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Logo/>
          <nav style={{display:"flex", gap:12}}>
            <button onClick={()=>setView("store")} className="hoverable">Store</button>
            <button onClick={()=>setView("admin")} className="hoverable">Admin</button>
            <button onClick={()=>setView("checkout")} className="hoverable">Cart ({cart.length})</button>
            <button onClick={()=>setView("checkout")} style={{padding:"8px 12px", borderRadius:8, color:"#fff", background:BRAND.accent}}>Checkout</button>
          </nav>
        </div>
      </header>

      {view==="store" && <Store products={products} addToCart={addToCart} />}
      {view==="admin" && <Admin products={products} setProducts={setProducts} />}
      {view==="checkout" && <Checkout cart={cart} removeFromCart={removeFromCart} totals={totals} clearCart={clearCart} />}

      <footer style={{marginTop:64, borderTop:"1px solid #eee"}}>
        <div style={{maxWidth:"1100px", margin:"0 auto", padding:"24px 16px", color:"#555"}}>
          <div style={{fontWeight:600, marginBottom:8}}>Fulfillment (manual dropshipping)</div>
          <p>After payment, you will purchase from SHEIN/TEMU/AliExpress and ship directly to the customer's address. Supplier prices are hidden from customers. Shipping cost is included in the total and broken down at checkout.</p>
        </div>
      </footer>
    </div>
  );
}

function Store({products, addToCart}){
  return (
    <main style={{maxWidth:"1100px", margin:"0 auto", padding:"0 16px"}}>
      <section style={{padding:"40px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:40, fontWeight:800, lineHeight:1.1}}>Best deals, shipped direct to you</h1>
          <p style={{marginTop:12, color:"#666"}}>Curated bargains from trusted platforms. Pay securely by card. We deliver straight to your door.</p>
          <div style={{marginTop:20, display:"flex", gap:12}}>
            <a href="#catalog" style={{padding:"12px 16px", borderRadius:10, color:"#fff", background:BRAND.accent, fontWeight:600, textDecoration:"none"}}>Shop deals</a>
            <a href="#how" style={{padding:"12px 16px", borderRadius:10, border:"1px solid #ddd", fontWeight:600, textDecoration:"none", color:"#111"}}>How it works</a>
          </div>
        </div>
        <div style={{border:"1px solid #eee", borderRadius:16, padding:24, boxShadow:"0 8px 20px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:18, fontWeight:600}}>Secure Payments</div>
          <ul style={{marginTop:10, color:"#666", fontSize:14}}>
            <li>Card payments via PayPal (no PayPal account needed)</li>
            <li>Supplier price hidden; you see it only in Admin</li>
            <li>Transparent checkout breakdown</li>
          </ul>
        </div>
      </section>

      <section id="catalog" style={{padding:"24px 0"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
          <h2 style={{fontSize:24, fontWeight:700}}>Today’s picks</h2>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:16}}>
          {products.map(p=> (
            <article key={p.id} style={{border:"1px solid #eee", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 20px rgba(0,0,0,0.04)"}}>
              <img src={p.image} alt={p.title} style={{width:"100%", height:190, objectFit:"cover"}}/>
              <div style={{padding:16}}>
                <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8}}>
                  <h3 style={{fontWeight:700, fontSize:18}}>{p.title}</h3>
                  {p.shipping===0 && (
                    <span style={{fontSize:12, padding:"4px 8px", borderRadius:999, fontWeight:600, background:"#e8f0ff", color: BRAND.accent}}>Free Shipping</span>
                  )}
                </div>
                <div style={{marginTop:8, fontSize:22, fontWeight:800}}>{formatEUR(p.price + p.shipping + 0.50)}</div>
                <div style={{marginTop:4, fontSize:12, color:"#777"}}>Includes taxes & fees where applicable</div>
                <button onClick={()=>addToCart(p)} style={{marginTop:12, width:"100%", padding:"10px 12px", borderRadius:10, color:"#fff", background:BRAND.accent, fontWeight:600}}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how" style={{padding:"40px 0"}}>
        <h2 style={{fontSize:24, fontWeight:700, marginBottom:8}}>How it works</h2>
        <ol style={{paddingLeft:18, color:"#555", lineHeight:1.8}}>
          <li>You order and pay securely by card.</li>
          <li>We place the order with our supplier.</li>
          <li>The supplier ships straight to your address.</li>
        </ol>
      </section>
    </main>
  );
}

function Admin({products, setProducts}){
  const [passOk, setPassOk] = useState(false);
  const [form, setForm] = useState({ title: "", image: "", price: 0, shipping: 0 });

  const ADMIN_PASSWORD = import.meta?.env?.VITE_ADMIN_PASSWORD || "demo";
  function login(e){
    e.preventDefault();
    const v = new FormData(e.currentTarget).get("pw");
    if (v === ADMIN_PASSWORD) setPassOk(true);
    else alert("Incorrect password");
  }
  function addProduct(){
    if(!form.title || !form.image) return alert("Please fill title and image URL");
    const id = "p" + Math.random().toString(36).slice(2,8);
    setProducts([...products, { id, ...form, price: +form.price, shipping: +form.shipping }]);
    setForm({ title: "", image: "", price: 0, shipping: 0 });
  }
  function removeProduct(id){ setProducts(products.filter(p=>p.id!==id)); }

  if(!passOk){
    return (
      <div style={{maxWidth:520, margin:"0 auto", padding:"64px 16px"}}>
        <h2 style={{fontSize:24, fontWeight:700, marginBottom:8}}>Admin Login</h2>
        <p style={{fontSize:14, color:"#666", marginBottom:12}}>(Enter admin password set in <b>VITE_ADMIN_PASSWORD</b>; defaults to <b>demo</b>)</p>
        <form onSubmit={login} style={{display:"grid", gap:8}}>
          <input name="pw" type="password" placeholder="Password" style={{border:"1px solid #ddd", borderRadius:8, padding:"10px 12px"}}/>
          <button style={{padding:"10px 12px", borderRadius:8, color:"#fff", background:BRAND.accent, fontWeight:600}}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{maxWidth:"1000px", margin:"0 auto", padding:"40px 16px"}}>
      <h2 style={{fontSize:24, fontWeight:700}}>Admin</h2>
      <div style={{marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
        <div style={{border:"1px solid #eee", borderRadius:16, padding:16}}>
          <h3 style={{fontWeight:700, marginBottom:12}}>Add product</h3>
          <div style={{display:"grid", gap:8}}>
            <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{border:"1px solid #ddd", borderRadius:8, padding:"10px 12px"}}/>
            <input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} style={{border:"1px solid #ddd", borderRadius:8, padding:"10px 12px"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <div>
                <label style={{fontSize:12, color:"#666"}}>Product price (€)</label>
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{width:"100%", border:"1px solid #ddd", borderRadius:8, padding:"10px 12px"}}/>
              </div>
              <div>
                <label style={{fontSize:12, color:"#666"}}>Shipping (€)</label>
                <input type="number" step="0.01" value={form.shipping} onChange={e=>setForm({...form,shipping:e.target.value})} style={{width:"100%", border:"1px solid #ddd", borderRadius:8, padding:"10px 12px"}}/>
              </div>
            </div>
            <div style={{fontSize:13, color:"#666"}}>Markup is fixed at €0.50 and added automatically.</div>
            <button onClick={addProduct} style={{padding:"10px 12px", borderRadius:8, color:"#fff", background:BRAND.accent, fontWeight:600}}>Add</button>
          </div>
        </div>
        <div>
          <h3 style={{fontWeight:700, marginBottom:12}}>Catalog</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            {products.map(p=> (
              <div key={p.id} style={{border:"1px solid #eee", borderRadius:16, overflow:"hidden"}}>
                <img src={p.image} alt="" style={{width:"100%", height:120, objectFit:"cover"}}/>
                <div style={{padding:12, fontSize:14}}>
                  <div style={{fontWeight:700}}>{p.title}</div>
                  <div>Price: {formatEUR(p.price)} | Ship: {formatEUR(p.shipping)}</div>
                  <div>Customer pays: <b>{formatEUR(p.price + p.shipping + 0.50)}</b></div>
                  <button onClick={()=>removeProduct(p.id)} style={{marginTop:8, padding:"6px 10px", borderRadius:8, color:"#fff", background:BRAND.accent}}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkout({cart, removeFromCart, totals, clearCart}) {
  useEffect(() => {
    // Render PayPal Card-only button if SDK is loaded
    if (window.paypal && window.paypal.Buttons) {
      try {
        const buttons = window.paypal.Buttons({
          // Force card-only funding
          fundingSource: window.paypal.FUNDING.CARD,

          // Create the order on the client (no backend call in sandbox)
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: "Arsen’s Deals order",
                amount: {
                  currency_code: "EUR",
                  value: totals.total.toFixed(2)
                }
              }]
            });
          },

          // Capture payment on approval
          onApprove: async (data, actions) => {
            try {
              const details = await actions.order.capture();
              // Optional: you can inspect `details` or show an order id:
              // alert(`Payment completed. Order: ${details.id}`);
              alert("Payment completed (Sandbox).");
              // TODO (later): call your backend to record the order
            } catch (err) {
              console.error(err);
              alert("Capture error. Please try again.");
            }
          },

          onError: (err) => {
            console.error(err);
            alert("Payment error. Please try again.");
          }
        });

        if (buttons.isEligible()) {
          buttons.render("#paypal-card-button");
        }
      } catch (e) {
        console.error("PayPal render error:", e);
      }
    }
  }, [totals.total]); // re-render button if total changes

  return (
    <div style={{maxWidth:"1000px", margin:"0 auto", padding:"40px 16px"}}>
      <h2 style={{fontSize:24, fontWeight:700, marginBottom:12}}>Checkout</h2>
      {cart.length===0 ? (
        <div style={{color:"#666"}}>Your cart is empty.</div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:24}}>
          <div style={{border:"1px solid #eee", borderRadius:16, padding:16}}>
            <h3 style={{fontWeight:700, marginBottom:12}}>Items</h3>
            <ul style={{listStyle:"none", margin:0, padding:0}}>
              {cart.map((it, i)=> (
                <li key={i} style={{padding:"12px 0", display:"flex", alignItems:"center", gap:12, borderTop:i? "1px solid #f0f0f0":"none"}}>
                  <img src={it.image} alt="" style={{width:64, height:64, objectFit:"cover", borderRadius:8}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600}}>{it.title}</div>
                    <div style={{fontSize:12, color:"#666"}}>{it.shipping===0 ? "Free Shipping eligible" : "Shipping included in total"}</div>
                  </div>
                  <div style={{fontWeight:700}}>{formatEUR(it.price + it.shipping + 0.50)}</div>
                  <button onClick={()=>removeFromCart(i)} style={{marginLeft:8, textDecoration:"underline", fontSize:13}}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{border:"1px solid #eee", borderRadius:16, padding:16, height:"fit-content"}}>
            <h3 style={{fontWeight:700, marginBottom:12}}>Order Summary</h3>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
              <span>Products</span><span>{formatEUR(totals.items)}</span>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:14, marginTop:6}}>
              <span>Shipping</span><span>{formatEUR(totals.shipping)}</span>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:14, marginTop:6}}>
              <span>Markup (fixed)</span><span>{formatEUR(totals.markup)}</span>
            </div>
            <div style={{borderTop:"1px solid #eee", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:18}}>
              <span>Total</span><span>{formatEUR(totals.total)}</span>
            </div>

            <div style={{marginTop:16, fontSize:12, color:"#666"}}>
              Your payment is processed securely. We never store card details.
            </div>

            {/* PayPal Card-only container */}
            <div id="paypal-card-button" style={{marginTop:16}}></div>

            <div style={{marginTop:16, fontSize:12, color:"#777"}}>
              After payment, you’ll receive an email receipt. We’ll ship directly to your address.
            </div>

            <div style={{marginTop:20, textAlign:"center"}}>
              <button onClick={clearCart} style={{textDecoration:"underline", fontSize:13}}>Clear cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
