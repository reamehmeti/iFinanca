#iFinanca
A web app for managing couriers, clients and invoices.

iFinanca.API: the backend (.NET + SQL Server)
iFinanca.Client: the website (React)
What you need
.NET 10 SDK
Node.js 22
Visual Studio (it includes the SQL Server LocalDB database)
How to run it
1. Create your settings file (only once)

Copy iFinanca.API/appsettings.Local.example.json, name the copy appsettings.Local.json, and write your own email and password in it. This is the account you log in with.

2. Start the backend

Open iFinanca.slnx in Visual Studio, choose https and press F5. The database is created automatically.

3. Start the website

In a terminal:

cd iFinanca.Client
npm install
npm run dev
4. Open the app

Go to http://localhost:5173 and log in with the email and password from step 1.