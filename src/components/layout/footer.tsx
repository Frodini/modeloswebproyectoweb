export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto py-6 px-4 md:px-6 text-center text-secondary-foreground">
        <p className="text-sm">&copy; {new Date().getFullYear()} AutoLink. All rights reserved.</p>
      </div>
    </footer>
  );
}
