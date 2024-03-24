export function Footer() {

  return (
    <div className="" >
      <footer className="footer grid-rows-1 p-10">
        <div>
          <span className="footer-title"></span>
        </div>
        <div>
          <span className="footer-title"></span>
        </div>
        <div>
          <span className="footer-title">About us</span>
          <a href="/" className="link link-hover">Home</a>
          <a href="/company" className="link link-hover">Company</a>
          <a href="/contact" className="link link-hover">Contact</a>
          <a href="/security" className="link link-hover">Security</a>
          <a href="https://docs.runreveal.com" className="link link-hover">Docs</a>
          <a href="https://blog.runreveal.com" className="link link-hover">Blog</a>
          <a href="/pricing" className="link link-hover">Pricing</a>
        </div>
        <div>
          <span className="footer-title">Legal</span>
          <a href="/terms-of-service" className="link link-hover">Terms of use</a>
          <a href="/privacy-policy" className="link link-hover">Privacy policy</a>
        </div>
        <div>
          <span className="footer-title">Social</span>
          <a href="https://twitter.com/runreveal" className="link link-hover">Twitter</a>
          <a href="https://github.com/runreveal" className="link link-hover">Github</a>
          <a href="https://discord.gg/n3y6WwPCg7" className="link link-hover">Discord</a>
        </div>
        <div>
          <span className="footer-title"></span>
        </div>
      </footer>
      <footer className="footer footer-center p-10 rounded">
        <div>
          <p>Copyright © 2023 - All right reserved by RunReveal, Inc.</p>
        </div>
      </footer>
    </div>
  )
}
export default Footer;
