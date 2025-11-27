import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { saveOrder } from './firebase';

const PRODUCTS = [
  { id: 'p1', title: 'সোনার চুড়ি', price: 1200, colors: ['গোলাপি','সোনালি'], sizes: ['S','M'], category: 'jewelry' },
  { id: 'p2', title: 'ক্যাজুয়াল শার্ট', price: 950, colors: ['কালো','সাদা'], sizes: ['M','L'], category: 'clothing' },
  { id: 'p3', title: 'ফোন কেস', price: 350, colors: ['নীল','সবুজ'], sizes: [], category: 'accessories' },
];

const CartContext = createContext();
function CartProvider({ children }){
  const [cart, setCart] = useState([]);
  useEffect(()=>{ const raw = localStorage.getItem('mm_cart'); if(raw) setCart(JSON.parse(raw)); },[]);
  useEffect(()=>{ localStorage.setItem('mm_cart', JSON.stringify(cart)); },[cart]);
  const add = (product, qty=1)=>{ setCart(prev=>{ const i = prev.findIndex(p=>p.id===product.id); if(i>-1){ const copy=[...prev]; copy[i].qty+=qty; return copy;} return [...prev, {...product, qty}]; }); };
  const remove = (id)=> setCart(prev=> prev.filter(p=>p.id!==id));
  const clear = ()=> setCart([]);
  const total = cart.reduce((s,p)=> s + p.price*p.qty, 0);
  return (<CartContext.Provider value={{cart, add, remove, clear, total}}>{children}</CartContext.Provider>);
}
const useCart = ()=> useContext(CartContext);
const formatBDT = n => `৳${n.toLocaleString('en-US')}`;

function Nav(){ const { cart } = useCart(); return (
  <header className="bg-white shadow">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">MyShop BD</Link>
      <nav className="space-x-4">
        <Link to="/shop" className="hover:underline">Shop</Link>
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/cart" className="relative">কার্ট <span className="ml-2 bg-gray-200 px-2 rounded">{cart.length}</span></Link>
      </div>
    </div>
  </header>
);}

function Home(){ return (
  <main className="container mx-auto p-4">
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div>
        <h1 className="text-3xl font-extrabold">স্বাগতম MyShop BD — আপনার পছন্দের জিনিস</h1>
        <p className="mt-4 text-gray-700">বাংলাদেশের জন্য কাস্টমাইজড ই-কমার্স সলিউশন — সহজ পেমেন্ট, ত্বরিত ডেলিভারি, নিরাপদ।</p>
        <Link to="/shop" className="inline-block mt-6 px-4 py-2 bg-black text-white rounded">এখনই শপ করুন</Link>
      </div>
      <div className="bg-gray-100 rounded p-6">প্রচার ব্যানার / হিরো ইমেজ</div>
    </section>
  </main>
);}

function Shop(){
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [results, setResults] = useState(PRODUCTS);

  useEffect(()=>{ let out = PRODUCTS.filter(p=> p.title.toLowerCase().includes(query.toLowerCase())); if(minPrice) out = out.filter(p=> p.price >= Number(minPrice)); if(maxPrice) out = out.filter(p=> p.price <= Number(maxPrice)); if(color) out = out.filter(p=> p.colors?.includes(color)); if(size) out = out.filter(p=> p.sizes?.includes(size)); setResults(out); },[query,minPrice,maxPrice,color,size]);

  return (
    <main className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Shop</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <div>
            <label className="block text-sm">Search</label>
            <input value={query} onChange={e=>setQuery(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="প্রোডাক্ট খুঁজুন..." />
          </div>
          <div>
            <label className="block text-sm">Price Min</label>
            <input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">Price Max</label>
            <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">Color</label>
            <select value={color} onChange={e=>setColor(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="">All</option>
              <option>গোলাপি</option>
              <option>সোনালি</option>
              <option>কালো</option>
              <option>সাদা</option>
              <option>নীল</option>
              <option>সবুজ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Size</label>
            <select value={size} onChange={e=>setSize(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="">All</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
            </select>
          </div>
        </aside>

        <section className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(p=> (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductCard({ product }){
  return (
    <div className="border rounded p-4 flex flex-col">
      <div className="h-40 bg-gray-50 mb-3 flex items-center justify-center">ইমেজ</div>
      <h3 className="font-semibold">{product.title}</h3>
      <p className="mt-2">{formatBDT(product.price)}</p>
      <div className="mt-4 flex gap-2 items-center">
        <Link to={`/product/${product.id}`} className="text-sm underline">বিস্তারিত</Link>
      </div>
    </div>
  );
}

function ProductDetail(){
  const { id } = useParams();
  const p = PRODUCTS.find(x=>x.id===id);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  if(!p) return <div className="p-4">পণ্য পাওয়া যায়নি</div>;
  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-100">Product Image</div>
        <div>
          <h2 className="text-2xl font-bold">{p.title}</h2>
          <p className="mt-2 text-xl">{formatBDT(p.price)}</p>
          <div className="mt-4">
            <label>Quantity</label>
            <input type="number" value={qty} min={1} onChange={e=>setQty(Number(e.target.value))} className="border rounded px-2 py-1 ml-2" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={()=>add(p, qty)} className="px-4 py-2 bg-black text-white rounded">কার্টে যোগ করুন</button>
            <Link to="/checkout" className="px-4 py-2 border rounded">চেকআউট</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CartPage(){
  const { cart, remove, clear, total } = useCart();
  return (
    <main className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>
      {cart.length===0 ? <p>কার্ট খালি</p> : (
        <div>
          <ul className="space-y-4">
            {cart.map(item=> (
              <li key={item.id} className="flex justify-between border p-3 rounded">
                <div>
                  <strong>{item.title}</strong>
                  <div> x {item.qty}</div>
                </div>
                <div className="text-right">
                  <div>{formatBDT(item.price * item.qty)}</div>
                  <button onClick={()=>remove(item.id)} className="text-sm text-red-600 mt-2">Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <div><button onClick={clear} className="px-3 py-2 border rounded">Clear</button></div>
            <div>
              <div className="font-semibold">Total: {formatBDT(total)}</div>
              <Link to="/checkout" className="inline-block mt-2 px-4 py-2 bg-black text-white rounded">চেকআউট</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Checkout(){
  const { cart, total, clear } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('cod');
  const navigate = useNavigate();

  const placeOrder = async ()=>{
    if(!name || !phone || !address){ alert('সব তথ্য পূরণ করুন'); return; }
    const order = { customer: {name, phone, address}, items: cart, total, method, createdAt: new Date().toISOString() };
    if(method==='cod'){
      try{
        await saveOrder({...order, status:'pending', payment: 'COD'});
        clear();
        alert('অর্ডার পাওয়া গেছে — ক্যাশ অন ডেলিভারি নির্বাচন করা হয়েছে।');
        navigate('/');
      }catch(err){ console.error(err); alert('Order save failed'); }
      return;
    }
    // For gateways, call server endpoint
    try{
      const resp = await fetch('/api/payments/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order, gateway: method }) });
      const data = await resp.json();
      if(data.paymentUrl) window.location.href = data.paymentUrl;
      else alert('Payment initiation failed');
    }catch(err){ console.error(err); alert('Payment error'); }
  }

  return (
    <main className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 rounded" />
          <label className="block mt-2">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border p-2 rounded" />
          <label className="block mt-2">Address</label>
          <textarea value={address} onChange={e=>setAddress(e.target.value)} className="w-full border p-2 rounded" />
          <div className="mt-4">
            <label className="block">Payment Method</label>
            <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full border p-2 rounded">
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bkash">bKash (Online)</option>
              <option value="nagad">Nagad (Online)</option>
              <option value="rocket">Rocket (Online)</option>
            </select>
          </div>
          <div className="mt-4">
            <button onClick={placeOrder} className="px-4 py-2 bg-black text-white rounded">Place Order</button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Order Summary</h3>
          <ul className="mt-2 space-y-2">
            {cart.map(it=> (<li key={it.id} className="flex justify-between"><div>{it.title} x {it.qty}</div><div>{formatBDT(it.price*it.qty)}</div></li>))}
          </ul>
          <div className="mt-4 font-bold">Total: {formatBDT(total)}</div>
        </div>
      </div>
    </main>
  );
}

function About(){ return (<main className="container mx-auto p-4"><h2>About</h2><p>আমাদের সম্পর্কে সংক্ষিপ্ত বিবরণ।</p></main>); }
function Contact(){ return (<main className="container mx-auto p-4"><h2>Contact</h2><p>যোগাযোগ ফর্ম / ইমেইল / ফোন</p></main>); }
function Terms(){ return (<main className="container mx-auto p-4"><h2>Terms & Conditions</h2></main>); }
function Privacy(){ return (<main className="container mx-auto p-4"><h2>Privacy Policy</h2></main>); }

export default function App(){
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/shop" element={<Shop/>} />
              <Route path="/product/:id" element={<ProductDetail/>} />
              <Route path="/cart" element={<CartPage/>} />
              <Route path="/checkout" element={<Checkout/>} />
              <Route path="/about" element={<About/>} />
              <Route path="/contact" element={<Contact/>} />
              <Route path="/terms" element={<Terms/>} />
              <Route path="/privacy" element={<Privacy/>} />
            </Routes>
          </div>
          <footer className="bg-gray-50 border-t mt-8">
            <div className="container mx-auto px-4 py-6 flex justify-between">
              <div><strong>MyShop BD</strong><div className="text-sm">© {new Date().getFullYear()}</div></div>
              <div className="text-sm"><Link to="/terms" className="mr-4">Terms</Link><Link to="/privacy">Privacy</Link></div>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}
