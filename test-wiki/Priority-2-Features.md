# Priority 2 Features Test Page

This page demonstrates all the newly added Priority 2 features.

[[_TOC_]]

## Table of Subpages

The `[[_TOSP_]]` tag generates a list of all pages in the current directory:

[[_TOSP_]]

---

## Mathematical Notation with KaTeX

### Inline Math
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ and Einstein's famous equation is $E = mc^2$.

### Block Math
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

### More Complex Equations
$$
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
$$

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$

---

## Emoji Shortcodes

You can use emoji shortcodes to add emojis to your content:

- :smile: Happy face
- :tada: Celebration
- :rocket: Launch
- :warning: Warning
- :white_check_mark: Check mark
- :x: Cross mark
- :bulb: Light bulb
- :fire: Fire
- :star: Star
- :heart: Heart
- :thumbsup: Thumbs up
- :eyes: Eyes
- :memo: Memo
- :books: Books
- :hammer: Hammer
- :computer: Computer

---

## @Mentions

You can mention users with the @ symbol:

- Hey @john, can you review this?
- Cc: @sarah @mike @alice
- Thanks @teamlead for the feedback!

Note: Mentions are styled but not functional in offline mode (as expected).

---

## Work Item Links

Reference work items with the # symbol:

- Fixed issue #123
- Related to #456 and #789
- See work item #1001 for more details
- This closes #55

Note: Work item links are styled but won't navigate anywhere in offline mode (as expected). Hover over them to see the tooltip.

---

## Attachment Links

You can link to attachments using the special syntax:

- Download the specification: [[attachment:requirements.pdf]]
- See the design: [[attachment:mockup.png]]
- View the spreadsheet: [[attachment:data.xlsx]]

Note: Attachment links are displayed with a paperclip icon. In offline mode, they won't download anything, but the syntax is recognized.

---

## Combining Features

You can combine all these features:

Hey @developer, the equation $E = mc^2$ in work item #42 needs review. :thinking:

The solution involves this matrix:

$$
\begin{pmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{pmatrix}
$$

Check the [[attachment:proof.pdf]] for details! :rocket:

---

## Wiki Navigation

Back to: [[index|Home Page]]
