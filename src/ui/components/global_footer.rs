use ratatui::{
    buffer::Buffer,
    layout::Rect,
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Paragraph, Widget},
};

/// Global footer showing keyboard shortcuts
pub struct GlobalFooter {
    hints: Vec<(&'static str, &'static str)>,
}

impl GlobalFooter {
    pub fn new() -> Self {
        Self {
            hints: vec![
                ("Tab", "Switch"),
                ("Ctrl+N", "New"),
                ("Ctrl+W", "Close"),
                ("Ctrl+C", "Interrupt"),
                ("Ctrl+Q", "Quit"),
                ("?", "Help"),
            ],
        }
    }

    pub fn with_hints(hints: Vec<(&'static str, &'static str)>) -> Self {
        Self { hints }
    }

    pub fn render(&self, area: Rect, buf: &mut Buffer) {
        let mut spans = Vec::new();

        for (i, (key, action)) in self.hints.iter().enumerate() {
            if i > 0 {
                spans.push(Span::raw(" │ "));
            }

            spans.push(Span::styled(
                format!("[{}]", key),
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ));
            spans.push(Span::raw(" "));
            spans.push(Span::styled(*action, Style::default().fg(Color::DarkGray)));
        }

        let line = Line::from(spans);
        let paragraph = Paragraph::new(line)
            .style(Style::default().bg(Color::Rgb(15, 15, 15)));

        paragraph.render(area, buf);
    }
}

impl Default for GlobalFooter {
    fn default() -> Self {
        Self::new()
    }
}
