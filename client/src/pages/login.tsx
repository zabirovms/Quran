import { useState } from 'react';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import './login.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="auth-page-root">
      <SeoHead title={isRegister ? 'Сабтином' : 'Вуруд'} description="Воридшавӣ ё сабтином ба сомона" />

      <div className={"auth-container" + (isRegister ? ' active' : '')}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login form */}
        <div className="form-box Login">
          <h2 className="animation" style={{ ['--D' as any]: 0, ['--S' as any]: 21 }}>Вуруд</h2>
          <form>
            <div className="input-box animation" style={{ ['--D' as any]: 1, ['--S' as any]: 22 }}>
              <input type="text" required />
              <label>Номи корбар</label>
            </div>
            <div className="input-box animation" style={{ ['--D' as any]: 2, ['--S' as any]: 23 }}>
              <input type="password" required />
              <label>Гузарвожа</label>
            </div>
            <div className="input-box animation" style={{ ['--D' as any]: 3, ['--S' as any]: 24 }}>
              <button className="btn" type="submit">Ворид шудан</button>
            </div>
            <div className="regi-link animation" style={{ ['--D' as any]: 4, ['--S' as any]: 25 }}>
              <p>
                Ҳоло ҳисоб надоред?
                <br />
                <button type="button" className="linklike" onClick={() => setIsRegister(true)}>Ҳисоб кушоед</button>
              </p>
            </div>
          </form>
        </div>

        {/* Login info */}
        <div className="info-content Login">
          <h2 className="animation" style={{ ['--D' as any]: 0, ['--S' as any]: 20 }}>ХУШ ОМАДЕД!</h2>
          <p className="animation" style={{ ['--D' as any]: 1, ['--S' as any]: 21 }}>
            Барои идома додани истифодаи хизматрасониҳо, лутфан ба ҳисоби худ ворид шавед.
          </p>
        </div>

        {/* Register form */}
        <div className="form-box Register">
          <h2 className="animation" style={{ ['--li' as any]: 17, ['--S' as any]: 0 }}>Сабтином</h2>
          <form>
            <div className="input-box animation" style={{ ['--li' as any]: 18, ['--S' as any]: 1 }}>
              <input type="text" required />
              <label>Номи корбар</label>
            </div>
            <div className="input-box animation" style={{ ['--li' as any]: 19, ['--S' as any]: 2 }}>
              <input type="email" required />
              <label>Почта</label>
            </div>
            <div className="input-box animation" style={{ ['--li' as any]: 19, ['--S' as any]: 3 }}>
              <input type="password" required />
              <label>Гузарвожа</label>
            </div>
            <div className="input-box animation" style={{ ['--li' as any]: 20, ['--S' as any]: 4 }}>
              <button className="btn" type="submit">Сабтином шудан</button>
            </div>
            <div className="regi-link animation" style={{ ['--li' as any]: 21, ['--S' as any]: 5 }}>
              <p>
                Аллакай ҳисоб доред?
                <br />
                <button type="button" className="linklike" onClick={() => setIsRegister(false)}>Ворид шавед</button>
              </p>
            </div>
          </form>
        </div>

        {/* Register info */}
        <div className="info-content Register">
          <h2 className="animation" style={{ ['--li' as any]: 17, ['--S' as any]: 0 }}>Сабтином шавед!</h2>
          <p className="animation" style={{ ['--li' as any]: 18, ['--S' as any]: 1 }}>
            Бо сабти ном шумо метавонед аз тамоми имкониятҳои мо истифода баред ва таҷрибаи шахсии худро дошта бошед.
          </p>
        </div>
      </div>

      <div className="back-home">
        <Link href="/">Ба Асосӣ</Link>
      </div>
    </div>
  );
}
