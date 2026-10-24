const { render, fire, q, qa } = $dom;

const SAMPLE_COMMENTS = [
  {
    id: 'c1',
    author: 'Alice',
    timestamp: '2h ago',
    text: 'Top level comment 1',
    children: [
      {
        id: 'c1-1',
        author: 'Bob',
        timestamp: '1h ago',
        text: 'First reply to Alice',
        children: [
          {
            id: 'c1-1-1',
            author: 'Charlie',
            timestamp: '30m ago',
            text: 'Deep nested reply to Bob',
          },
        ],
      },
    ],
  },
  {
    id: 'c2',
    author: 'Diana',
    timestamp: '10m ago',
    text: 'Top level comment 2 without replies',
  },
];

const getComment = (c, id) => q(`li[data-comment-id="${id}"]`, c);

{
  const r = render(<NestedComments comments={SAMPLE_COMMENTS} />);
  const c1 = getComment(r.container, 'c1');
  const c2 = getComment(r.container, 'c2');
  const hasAuthors = q('[data-author]', c1)?.textContent === 'Alice' && q('[data-author]', c2)?.textContent === 'Diana';
  const hasText = q('[data-text]', c1)?.textContent === 'Top level comment 1';
  const child = getComment(r.container, 'c1-1');

  $test.check(
    'Renders comment hierarchy with author info, text, and nested children',
    c1 !== null && c2 !== null && hasAuthors && hasText && child !== null,
    { hasC1: c1 !== null, hasC2: c2 !== null, hasAuthors, hasText, hasChild: child !== null }
  );
  r.unmount();
}

{
  const r = render(<NestedComments comments={SAMPLE_COMMENTS} />);
  const c1 = getComment(r.container, 'c1');
  const collapseBtn = q('button[data-action="toggle-collapse"]', c1);
  const initialCollapseLabel = collapseBtn !== null && collapseBtn.textContent === 'Collapse';

  fire.click(collapseBtn);
  const childAfterCollapse = getComment(r.container, 'c1-1');
  const expandLabel = collapseBtn.textContent === 'Expand';

  fire.click(collapseBtn);
  const childAfterReopen = getComment(r.container, 'c1-1');

  $test.check(
    'Collapse button hides child comments and changes to Expand, and expands on re-click',
    initialCollapseLabel && childAfterCollapse === null && expandLabel && childAfterReopen !== null,
    { initialCollapseLabel, childAfterCollapse, expandLabel, childAfterReopen }
  );
  r.unmount();
}

{
  const replies = [];
  const r = render(<NestedComments comments={SAMPLE_COMMENTS} onAddReply={(parentId, text) => replies.push({ parentId, text })} />);
  const c2 = getComment(r.container, 'c2');
  const replyBtn = q('button[data-action="reply"]', c2);

  fire.click(replyBtn);
  const input = q('textarea[data-reply-input]', c2);
  const submitBtn = q('button[data-action="submit-reply"]', c2);

  fire.change(input, 'Great point Diana!');
  fire.click(submitBtn);

  const closedAfterSubmit = q('textarea[data-reply-input]', c2) === null;
  const replyRecorded = replies.length === 1 && replies[0].parentId === 'c2' && replies[0].text === 'Great point Diana!';

  $test.check(
    'Reply composer submits non-empty text, notifies onAddReply, and closes composer',
    input !== null && submitBtn !== null && closedAfterSubmit && replyRecorded,
    { hasInput: input !== null, closedAfterSubmit, replyRecorded }
  );
  r.unmount();
}

{
  const replies = [];
  const r = render(<NestedComments comments={SAMPLE_COMMENTS} onAddReply={(p, t) => replies.push({ p, t })} />);
  const c2 = getComment(r.container, 'c2');
  fire.click(q('button[data-action="reply"]', c2));

  const input = q('textarea[data-reply-input]', c2);
  fire.change(input, '   ');
  fire.click(q('button[data-action="submit-reply"]', c2));

  $test.check(
    'Submitting blank or whitespace-only reply does not invoke onAddReply',
    replies.length === 0,
    { repliesCount: replies.length }
  );
  r.unmount();
}

{
  // maxDepth = 2: c1 (depth 1) can reply, c1-1 (depth 2) CANNOT reply
  const r = render(<NestedComments comments={SAMPLE_COMMENTS} maxDepth={2} />);
  const c1 = getComment(r.container, 'c1');
  const c11 = getComment(r.container, 'c1-1');

  const c1CanReply = q('button[data-action="reply"]', c1) !== null;
  const c11CanReply = q('button[data-action="reply"]', c11) !== null;

  $test.check(
    'Enforces maxDepth by omitting Reply button on comments at or beyond depth limit',
    c1CanReply === true && c11CanReply === false,
    { c1CanReply, c11CanReply }
  );
  r.unmount();
}
