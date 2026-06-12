import React, { useState, useEffect } from "react";
import { 
  TrendingUp, DollarSign, Layers, Calendar, 
  RefreshCw, AlertCircle, CheckCircle2, Sliders, 
  BarChart3, Info, HelpCircle 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";

export default function App() {
  const [inputs, setInputs] = useState({
    quantity: 35,
    price_each: 85.50,
    msrp: 100.00,
    product_line: "Classic Cars",
    deal_size: "Medium",
    order_date: new Date().toISOString().split("T")[0],
  });

  const [prediction, setPrediction] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const productLines = meta?.product_lines || [
    "Classic Cars", "Vintage Cars", "Motorcycles", 
    "Planes", "Ships", "Trains", "Trucks and Buses"
  ];
  const dealSizes = ["Small", "Medium", "Large"];

  useEffect(() => {
    fetch("http://localhost:8000/model-info")
      .then((res) => {
        if (!res.ok) throw new Error("Metadata unavailable");
        return res.json();
      })
      .then((data) => setMeta(data))
      .catch((err) => console.warn("Backend offline or metadata error:", err));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handlePredict();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "quantity" || field === "price_each") {
        const total = updated.quantity * updated.price_each;
        if (total < 3000) updated.deal_size = "Small";
        else if (total < 7000) updated.deal_size = "Medium";
        else updated.deal_size = "Large";
      }
      return updated;
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: parseInt(inputs.quantity),
          price_each: parseFloat(inputs.price_each),
          msrp: parseFloat(inputs.msrp),
          product_line: inputs.product_line,
          deal_size: inputs.deal_size,
          order_date: inputs.order_date || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Prediction failed");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!prediction) return [];
    const base = prediction.predicted_sales;
    return [
      { name: "-20% Qty", Revenue: base * 0.8, Low: prediction.confidence_band_low * 0.8, High: prediction.confidence_band_high * 0.8 },
      { name: "-10% Qty", Revenue: base * 0.9, Low: prediction.confidence_band_low * 0.9, High: prediction.confidence_band_high * 0.9 },
      { name: "Current Estimate", Revenue: base, Low: prediction.confidence_band_low, High: prediction.confidence_band_high },
      { name: "+10% Qty", Revenue: base * 1.1, Low: prediction.confidence_band_low * 1.1, High: prediction.confidence_band_high * 1.1 },
      { name: "+20% Qty", Revenue: base * 1.2, Low: prediction.confidence_band_low * 1.2, High: prediction.confidence_band_high * 1.2 },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">RevCast AI</h1>
            <p className="text-xs text-slate-400">Sales Predictive Engine • GradientBoosting v1.0</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
          <span className={`h-2 w-2 rounded-full ${meta ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium">
            {meta ? `Model Ready (Test R²: ${meta.test_r2})` : "Connecting to model..."}
          </span>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <section className="lg:col-span-4 bg-slate-800/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl h-fit">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-800">
            <Sliders className="w-4 w-4 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Parameters Simulation</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Quantity Ordered
                </label>
                <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {inputs.quantity} units
                </span>
              </div>
              <input 
                type="range" min="1" max="100" step="1"
                value={inputs.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Deal Price Each
                </label>
                <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  ${parseFloat(inputs.price_each).toFixed(2)}
                </span>
              </div>
              <input 
                type="range" min="10" max="250" step="0.5"
                value={inputs.price_each}
                onChange={(e) => handleInputChange("price_each", e.target.value)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>$10</span>
                <span>$130</span>
                <span>$250</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" /> Manufacturer MSRP
                </label>
                <span className="text-sm font-mono font-bold text-slate-300 bg-slate-700 px-2 py-0.5 rounded border border-slate-600">
                  ${parseFloat(inputs.msrp).toFixed(2)}
                </span>
              </div>
              <input 
                type="range" min="10" max="250" step="0.5"
                value={inputs.msrp}
                onChange={(e) => handleInputChange("msrp", e.target.value)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Product Line Category</label>
              <select 
                value={inputs.product_line}
                onChange={(e) => handleInputChange("product_line", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 shadow-inner focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                {productLines.map((line) => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Calculated Deal Class
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dealSizes.map((size) => {
                  const isActive = inputs.deal_size === size;
                  return (
                    <div
                      key={size}
                      className={`text-center py-2.5 rounded-xl border font-medium text-xs transition duration-200 capitalize ${
                        isActive 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                *Automatically mapped from transaction volume (Qty × Price).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Estimated Close Date
              </label>
              <input 
                type="date"
                value={inputs.order_date}
                onChange={(e) => handleInputChange("order_date", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono text-sm"
              />
            </div>
          </div>
        </section>

        <section className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20 mb-3">
                  <BarChart3 className="w-3 h-3" /> Machine Learning Forecast
                </span>
                <h3 className="text-slate-400 font-medium text-sm">Predicted Total Order Value</h3>
                
                {loading && !prediction ? (
                  <div className="h-16 flex items-center space-x-3 mt-1">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-slate-400 animate-pulse text-lg">Running inference pipeline...</span>
                  </div>
                ) : error ? (
                  <div className="mt-2 flex items-center space-x-2 text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                ) : prediction ? (
                  <div className="mt-1">
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                      ${prediction.predicted_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl text-slate-500 font-medium mt-1">Adjust parameters to compute</div>
                )}
              </div>

              {prediction && !error && (
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 min-w-[240px] shadow-inner">
                  <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex justify-between">
                    <span>Statistical Bounds</span>
                    <span className="text-indigo-400">95% Conf.</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Optimistic High:</span>
                      <span className="font-mono font-bold text-emerald-400">${prediction.confidence_band_high.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 h-full w-2/3 mx-auto rounded-full" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Conservative Low:</span>
                      <span className="font-mono font-bold text-amber-400">${prediction.confidence_band_low.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {prediction && (
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pipeline context: <span className="font-mono text-slate-200">{prediction.model_note}</span></span>
                </div>
                {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
              </div>
            )}
          </div>

          <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-6 flex-1 flex flex-col min-h-[350px]">
            <div className="mb-4">
              <h4 className="text-md font-semibold text-white">Order Scale Sensitivity Curves</h4>
              <p className="text-xs text-slate-400">Simulating total predicted outcome variance across baseline deviations</p>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
              {prediction ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                      formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                    />
                    <Area type="monotone" dataKey="Revenue" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="High" stroke="#34d399" strokeWidth={1} strokeDasharray="4 4" fillOpacity={0} />
                    <Area type="monotone" dataKey="Low" stroke="#fbbf24" strokeWidth={1} strokeDasharray="4 4" fillOpacity={0} />
                    <ReferenceLine x="Current Estimate" stroke="#4f46e5" strokeWidth={1.5} label={{ value: '🎯 Live Focus', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                  <HelpCircle className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-sm">Chart automatically populates upon inference execution loop</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}