interface AuthorRecord {
  id: string;
  name: string;
}

interface BookRecord {
  id: string;
  title: string;
  authorId: string;
}

interface LibraryContext {
  db: {
    getAuthors(): AuthorRecord[];
    getAuthorById(id: string): AuthorRecord | null;
    getBooks(): BookRecord[];
    getBooksByAuthorId(authorId: string): BookRecord[];
  };
}

interface LibraryResolvers {
  Query: {
    authors(_parent: any, _args: any, context: LibraryContext): AuthorRecord[];
    books(_parent: any, _args: any, context: LibraryContext): BookRecord[];
    author(_parent: any, args: { id: string }, context: LibraryContext): AuthorRecord | null;
  };
  Author: {
    books(parent: AuthorRecord, _args: any, context: LibraryContext): BookRecord[];
  };
  Book: {
    author(parent: BookRecord, _args: any, context: LibraryContext): AuthorRecord | null;
  };
}

function createLibraryResolvers(): LibraryResolvers {
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
