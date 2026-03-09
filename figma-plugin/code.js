figma.showUI(__html__, { width: 320, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-frame' && msg.data) {
    await createReportFrame(msg.data);
  }
};

async function createReportFrame(data) {
  const frame = figma.createFrame();
  frame.resize(800, 1000);
  frame.name = 'UX Rival Report';
  
  // Background
  const bg = figma.createRectangle();
  bg.resize(800, 1000);
  bg.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.04 } }];
  frame.appendChild(bg);
  
  let yPosition = 40;
  
  // Header
  const headerText = figma.createText();
  headerText.characters = 'UX Rival Report';
  headerText.fontSize = 32;
  headerText.fontName = { family: 'Inter', style: 'Bold' };
  headerText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 1, b: 0.28 } }];
  headerText.x = 40;
  headerText.y = yPosition;
  frame.appendChild(headerText);
  yPosition += 60;
  
  // Headline
  if (data.headline) {
    const headlineText = figma.createText();
    headlineText.characters = data.headline;
    headlineText.fontSize = 24;
    headlineText.fontName = { family: 'Inter', style: 'Medium' };
    headlineText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    headlineText.x = 40;
    headlineText.y = yPosition;
    headlineText.resize(720, 100);
    frame.appendChild(headlineText);
    yPosition += 100;
  }
  
  // Summary
  if (data.sum) {
    const summaryText = figma.createText();
    summaryText.characters = `Overview: ${data.sum}`;
    summaryText.fontSize = 16;
    summaryText.fontName = { family: 'Inter', style: 'Regular' };
    summaryText.fills = [{ type: 'SOLID', color: { r: 0.69, g: 0.69, b: 0.74 } }];
    summaryText.x = 40;
    summaryText.y = yPosition;
    summaryText.resize(720, 80);
    frame.appendChild(summaryText);
    yPosition += 100;
  }
  
  // Scores
  if (data.scores || data.category_score) {
    const scoresTitle = figma.createText();
    scoresTitle.characters = 'UX Scores';
    scoresTitle.fontSize = 20;
    scoresTitle.fontName = { family: 'Inter', style: 'Bold' };
    scoresTitle.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    scoresTitle.x = 40;
    scoresTitle.y = yPosition;
    frame.appendChild(scoresTitle);
    yPosition += 40;
    
    if (data.scores) {
      Object.entries(data.scores).forEach(([name, score]) => {
        // Score background
        const scoreBg = figma.createRectangle();
        scoreBg.resize(720, 60);
        scoreBg.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
        scoreBg.x = 40;
        scoreBg.y = yPosition;
        frame.appendChild(scoreBg);
        
        // Name
        const nameText = figma.createText();
        nameText.characters = name;
        nameText.fontSize = 16;
        nameText.fontName = { family: 'Inter', style: 'Medium' };
        nameText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        nameText.x = 60;
        nameText.y = yPosition + 20;
        frame.appendChild(nameText);
        
        // Score
        const scoreText = figma.createText();
        scoreText.characters = `${score}/100`;
        scoreText.fontSize = 18;
        scoreText.fontName = { family: 'Inter', style: 'Bold' };
        scoreText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 1, b: 0.28 } }];
        scoreText.x = 680;
        scoreText.y = yPosition + 18;
        frame.appendChild(scoreText);
        
        yPosition += 70;
      });
    } else if (data.category_score) {
      // Score background
      const scoreBg = figma.createRectangle();
      scoreBg.resize(720, 60);
      scoreBg.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      scoreBg.x = 40;
      scoreBg.y = yPosition;
      frame.appendChild(scoreBg);
      
      // Name
      const nameText = figma.createText();
      nameText.characters = 'Category Score';
      nameText.fontSize = 16;
      nameText.fontName = { family: 'Inter', style: 'Medium' };
      nameText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      nameText.x = 60;
      nameText.y = yPosition + 20;
      frame.appendChild(nameText);
      
      // Score
      const scoreText = figma.createText();
      scoreText.characters = `${data.category_score}/100`;
      scoreText.fontSize = 18;
      scoreText.fontName = { family: 'Inter', style: 'Bold' };
      scoreText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 1, b: 0.28 } }];
      scoreText.x = 680;
      scoreText.y = yPosition + 18;
      frame.appendChild(scoreText);
      
      yPosition += 70;
    }
  }
  
  // Recommendations
  const recommendations = [];
  if (data.secs) {
    data.secs.forEach(section => {
      if (section.rows) {
        section.rows.forEach(row => {
          if (row.rec) {
            recommendations.push(row.rec);
          }
        });
      }
    });
  }
  
  if (recommendations.length > 0) {
    yPosition += 20;
    
    const recTitle = figma.createText();
    recTitle.characters = 'Top Recommendations';
    recTitle.fontSize = 20;
    recTitle.fontName = { family: 'Inter', style: 'Bold' };
    recTitle.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    recTitle.x = 40;
    recTitle.y = yPosition;
    frame.appendChild(recTitle);
    yPosition += 40;
    
    recommendations.slice(0, 5).forEach((rec, index) => {
      // Recommendation background
      const recBg = figma.createRectangle();
      recBg.resize(720, 50);
      recBg.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      recBg.x = 40;
      recBg.y = yPosition;
      frame.appendChild(recBg);
      
      // Arrow
      const arrowText = figma.createText();
      arrowText.characters = '→';
      arrowText.fontSize = 16;
      arrowText.fontName = { family: 'Inter', style: 'Bold' };
      arrowText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 1, b: 0.28 } }];
      arrowText.x = 60;
      arrowText.y = yPosition + 15;
      frame.appendChild(arrowText);
      
      // Recommendation text
      const recText = figma.createText();
      recText.characters = rec;
      recText.fontSize = 14;
      recText.fontName = { family: 'Inter', style: 'Regular' };
      recText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      recText.x = 90;
      recText.y = yPosition + 15;
      recText.resize(650, 30);
      frame.appendChild(recText);
      
      yPosition += 60;
    });
  }
  
  // Gap opportunity
  if (data.opp) {
    yPosition += 20;
    
    const gapBg = figma.createRectangle();
    gapBg.resize(720, 80);
    gapBg.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.94 } }];
    gapBg.x = 40;
    gapBg.y = yPosition;
    frame.appendChild(gapBg);
    
    const gapLabel = figma.createText();
    gapLabel.characters = 'OPPORTUNITY';
    gapLabel.fontSize = 10;
    gapLabel.fontName = { family: 'Inter', style: 'Bold' };
    gapLabel.fills = [{ type: 'SOLID', color: { r: 0.54, g: 0.48, b: 0 } }];
    gapLabel.x = 60;
    gapLabel.y = yPosition + 15;
    frame.appendChild(gapLabel);
    
    const gapText = figma.createText();
    gapText.characters = data.opp;
    gapText.fontSize = 14;
    gapText.fontName = { family: 'Inter', style: 'Regular' };
    gapText.fills = [{ type: 'SOLID', color: { r: 0.33, g: 0.33, b: 0.33 } }];
    gapText.x = 60;
    gapText.y = yPosition + 35;
    gapText.resize(680, 40);
    frame.appendChild(gapText);
  }
  
  // Select and zoom to frame
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  
  figma.notify('UX Rival report created!');
}
