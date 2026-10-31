function createLibraryResolvers() {
  return {
    Query: {
      authors(_parent, _args, context) {
        return context.db.getAuthors();
      },
      books(_parent, _args, context) {
        return context.db.getBooks();
      },
      author(_parent, args, context) {
        return context.db.getAuthorById(args.id);
      },
    },
    Author: {
      books(parent, _args, context) {
        return context.db.getBooksByAuthorId(parent.id);
      },
    },
    Book: {
      author(parent, _args, context) {
        return context.db.getAuthorById(parent.authorId);
      },
    },
  };
}
