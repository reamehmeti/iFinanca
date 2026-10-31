import { company } from '../companyInfo'

function AppFooter() {
    const year = new Date().getFullYear()

    return (
        <footer className="app-footer">
            <div className="app-footer-inner">
                <section className="footer-column footer-about">
                    <div className="footer-brand">
                        <span className="brand-icon brand-icon-small">i</span>
                        iFinanca
                    </div>
                    <p>
                        Zhvilluar nga <strong>{company.name}</strong>, {company.description}
                    </p>
                </section>

                <section className="footer-column">
                    <h3>Zyra</h3>
                    <address>
                        {company.address}
                        <br />
                        {company.city}
                    </address>
                </section>

                <section className="footer-column">
                    <h3>Kontakti</h3>
                    <ul>
                        <li>
                            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
                        </li>
                        <li>
                            <a href={`mailto:${company.email}`}>{company.email}</a>
                        </li>
                    </ul>
                </section>

                <section className="footer-column">
                    <h3>Na ndiqni</h3>
                    <ul>
                        <li>
                            <a href={company.website} target="_blank" rel="noreferrer">
                                tretek.io
                            </a>
                        </li>
                        <li>
                            <a href={company.facebook} target="_blank" rel="noreferrer">
                                Facebook
                            </a>
                        </li>
                    </ul>
                </section>
            </div>

            <div className="app-footer-bottom">
                © {year} {company.name} · iFinanca. Të gjitha të drejtat e rezervuara.
            </div>
        </footer>
    )
}

export default AppFooter
