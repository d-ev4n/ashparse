
# Ashparse

A web scraping platform built with Django REST Framework and React.

Ashparse allows users to extract structured data from websites using custom CSS selectors through a simple web interface and REST API.

## Features

- User registration and login
- Website data extraction using CSS selectors
- API key generation and authentication
- Scraping history
- REST API integration
- Responsive interface
- Light and dark themes

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios

**Backend**
- Python
- Django
- Django REST Framework
- BeautifulSoup
- Requests

**Database**
- PostgreSQL

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Login |
| POST | `/api/scrape/` | Scrape website data |
| GET | `/api/history/` | View scraping history |
| POST | `/api/keys/generate/` | Generate API key |

## Example Scraping Request

```json
{
  "url": "https://books.toscrape.com/",
  "selectors": {
    "title": "h1",
    "prices": ".product_pod .price_color"
  }
}
```

## Project Structure

```text
ashparse/
├── backend/
│   ├── apikeys/
│   ├── config/
│   ├── scraper/
│   ├── users/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables in `backend/.env`, then run:

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Configure the backend `.env` file with the required Django secret key and PostgreSQL database credentials. Never commit your actual `.env` file.

## Author

Devadarsan S.
