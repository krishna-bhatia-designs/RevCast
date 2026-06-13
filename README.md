# RevCast AI 🚀

> **Advanced Sales Predictive Engine** — Machine Learning-powered revenue forecasting for data-driven business decisions

![GitHub repo size](https://img.shields.io/github/repo-size/krishna-bhatia-designs/RevCast?style=flat-square&logo=github)
![GitHub Last Commit](https://img.shields.io/github/last-commit/krishna-bhatia-designs/RevCast?style=flat-square&logo=github)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## 📋 Overview

**RevCast AI** is a full-stack machine learning application that predicts order values and revenue forecasts using gradient boosting models. It combines a sophisticated backend inference engine with an intuitive, interactive frontend UI for real-time sales predictions and sensitivity analysis.

### Key Features

✨ **Real-Time Predictions** — Instant ML-powered sales forecasting  
📊 **Interactive Dashboard** — Parameter simulation with live chart updates  
📈 **Sensitivity Analysis** — Explore revenue variance across different scenarios  
🎯 **Confidence Intervals** — 95% statistical bounds for risk assessment  
⚡ **High Performance** — Optimized inference pipeline with sub-second latency  
🎨 **Modern UI** — Responsive dark theme with gradient accents (Tailwind CSS + Vite)

---

## 🏗️ Architecture

```
RevCast/
├── frontend/                 # React + Vite + TailwindCSS UI
│   ├── src/
│   │   ├── App.jsx          # Main dashboard component
│   │   ├── main.jsx         # Entry point
│   │   └── ...
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite build configuration
│
├── backend/                 # FastAPI/Python ML backend (TBD)
│   ├── main.py             # FastAPI server & endpoints
│   ├── model.py            # Model inference logic
│   ├── requirements.txt     # Python dependencies
│   └── ...
│
├── data/                    # Training data & datasets
│
└── package.json            # Root dependencies
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.3.1 |
| **Build Tool** | Vite | 5.3.1 |
| **Styling** | TailwindCSS | 3.4.4 |
| **Charts** | Recharts | 2.12.0 |
| **Icons** | Lucide React | 0.300.0 |
| **Backend** | FastAPI/Python | (In Development) |
| **ML Model** | GradientBoosting | v1.0 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 16.x
- **npm** or **yarn**
- **Python** >= 3.8 (for backend)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/krishna-bhatia-designs/RevCast.git
cd RevCast
```

#### 2. Install Root Dependencies

```bash
npm install
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### 4. Backend Setup (Optional - if backend is available)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📦 Running the Application

### Development Mode

#### Start Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

#### Start Backend (Port 8000)

```bash
cd backend
python main.py
```

The API will be available at: `http://localhost:8000`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

The compiled assets will be in `frontend/dist/`

#### Preview Production Build

```bash
cd frontend
npm run preview
```

---

## 🎯 Features & Usage

### Parameter Simulation Panel

Adjust the following parameters in real-time:

- **Quantity Ordered** — Range: 1-100 units
- **Deal Price Each** — Range: $10-$250
- **Manufacturer MSRP** — Reference pricing
- **Product Line Category** — Classic Cars, Vintage Cars, Motorcycles, Planes, Ships, Trains, Trucks & Buses
- **Estimated Close Date** — Order date for temporal context
- **Deal Size** — Auto-calculated (Small/Medium/Large) based on transaction volume

### Machine Learning Forecast

The system displays:

- **Predicted Total Order Value** — Central ML prediction
- **Confidence Interval** — Upper and lower statistical bounds (95%)
- **Model Status** — Real-time connection to inference pipeline

### Sensitivity Analysis Charts

Visualize revenue predictions across:

- **-20% to +20% quantity variance**
- **Confidence band upper/lower bounds**
- **Interactive tooltips** with exact values

---

## 📡 API Endpoints

### Backend Endpoints (Expected)

#### Get Model Info

```http
GET http://localhost:8000/model-info
```

**Response:**
```json
{
  "test_r2": 0.85,
  "product_lines": ["Classic Cars", "Vintage Cars", ...],
  "model_version": "1.0"
}
```

#### Make Prediction

```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "quantity": 35,
  "price_each": 85.50,
  "msrp": 100.00,
  "product_line": "Classic Cars",
  "deal_size": "Medium",
  "order_date": "2026-06-13"
}
```

**Response:**
```json
{
  "predicted_sales": 2992.50,
  "confidence_band_low": 2500.00,
  "confidence_band_high": 3485.00,
  "model_note": "GradientBoosting inference complete"
}
```

---

## 🛠️ Development

### Project Structure

```
frontend/src/
├── App.jsx              # Main component (650+ lines)
│   ├── useState hooks   # Parameter state management
│   ├── useEffect hooks  # Data fetching & debouncing
│   ├── Event handlers   # Parameter changes & predictions
│   └── UI components    # Dashboard layout & charts
├── main.jsx             # React entry point
├── index.css            # Global styles
└── App.css              # Component styles
```

### Key Dependencies

**Frontend:**
- `react` — UI library
- `react-dom` — React rendering
- `vite` — Build tool
- `tailwindcss` — Utility CSS framework
- `recharts` — Responsive charts
- `lucide-react` — Icon library
- `autoprefixer` — CSS vendor prefixes
- `postcss` — CSS processor

### Building & Deployment

```bash
# Install dependencies
npm install && cd frontend && npm install

# Build for production
npm run build

# Test the build locally
npm run preview
```

---

## 📊 Model Information

- **Algorithm:** Gradient Boosting Regressor
- **Version:** 1.0
- **Performance Metric:** Test R² = 0.85+ (varies by dataset)
- **Input Features:** Quantity, Price, MSRP, Product Line, Deal Size, Order Date
- **Output:** Predicted Sales Revenue + Confidence Bands
- **Inference Speed:** Sub-second per prediction

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes before submitting
- Update documentation as needed

---

## 🐛 Troubleshooting

### Frontend won't connect to backend

**Issue:** Error message "Backend offline or metadata error"

**Solution:**
1. Ensure backend is running on `http://localhost:8000`
2. Check CORS settings on backend
3. Verify network connectivity
4. Check browser console for specific errors

### Predictions not updating

**Issue:** Chart and forecast remain empty

**Solution:**
1. Adjust any parameter slider
2. Check that backend is responding to `/predict`
3. Verify input data is valid JSON
4. Check browser DevTools Network tab

### Build errors with Vite

**Issue:** `npm run build` fails

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
npm run build
```

---

## 📝 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## 👨‍💻 Author

**Krishna Bhatia**  
[@krishna-bhatia-designs](https://github.com/krishna-bhatia-designs)

---

## 🙏 Acknowledgments

- **Recharts** — For beautiful, responsive chart components
- **Lucide React** — For clean, modern icons
- **TailwindCSS** — For utility-first CSS framework
- **Vite** — For blazing-fast build tooling
- **React** — For the UI library backbone

---

## 📞 Support

Have questions or found an issue? 

- 📧 Open an [Issue](https://github.com/krishna-bhatia-designs/RevCast/issues)
- 💬 Start a [Discussion](https://github.com/krishna-bhatia-designs/RevCast/discussions)
- 🔗 Check [GitHub Wiki](https://github.com/krishna-bhatia-designs/RevCast/wiki)

---

<div align="center">

**Made with ❤️ by Krishna Bhatia**

⭐ If this project helped you, please consider giving it a star!

</div>
