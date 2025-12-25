const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Al Akhawayn University</h3>
            <p className="text-primary-foreground/80">
              School of Science & Engineering
              <br />
              Immersive Learning Lab
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <a href="#about" className="hover:text-primary-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-primary-foreground transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#collaborators" className="hover:text-primary-foreground transition-colors">
                  Team
                </a>
              </li>
              <li>
                <a href="#workshops" className="hover:text-primary-foreground transition-colors">
                  Workshops
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-primary-foreground/80">
              For inquiries about the Immersive Learning Lab, please contact the School of Science & Engineering at Al Akhawayn University in Ifrane.
            </p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Al Akhawayn University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
