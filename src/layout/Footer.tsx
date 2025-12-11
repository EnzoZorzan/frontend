import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Plataforma de Pesquisas — Todos os direitos reservados
    </footer>
  );
}
