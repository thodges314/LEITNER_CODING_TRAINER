function Preview() {
  const props = usePreviewProps({
    userId: 'usr_101',
    name: 'Alex Morgan',
    role: 'Lead Engineer',
    email: 'alex.morgan@company.com',
  });

  const [element, setElement] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchUser = async (id) => ({
      id: id || props.userId,
      name: props.name,
      role: props.role,
      email: props.email,
      passwordHash: '$2b$12$securePasswordHashDoNotExpose',
      apiSecret: 'sk_live_secret_token_never_send_to_client',
      createdAt: new Date('2024-01-15T09:00:00Z'),
    });

    UserProfileContainer({
      userId: props.userId,
      fetchUser,
    }).then((el) => {
      if (active) setElement(el);
    }).catch((err) => {
      if (active) setElement(React.createElement('div', { className: 'p-4 text-red-400 font-mono text-sm' }, String(err)));
    });

    return () => { active = false; };
  }, [props.userId, props.name, props.role, props.email]);

  return (
    <div className="p-6 bg-slate-900 min-h-[200px] flex items-center justify-center rounded-lg">
      {element || <div className="text-slate-400 text-sm animate-pulse">Loading Server Component...</div>}
    </div>
  );
}

<Preview />

