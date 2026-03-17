const AppCopyright = ({ className = "" }: { className?: string }) => {
  return (
    <div className={className}>
      <a
        href="https://www.linkedin.com/in/john-tasie"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 transition-colors hover:text-violet-400 hover:underline"
      >
        © John Tasie
      </a>
    </div>
  );
};

export default AppCopyright;
