# LumaPet

An original, privacy-conscious virtual companion game. The repository is split into a React/Vite client and a FastAPI service so avatar processing can evolve independently of the game UI.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

In another terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Copy `frontend/.env.example` to `frontend/.env` to change the API address.
