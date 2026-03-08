import React from 'react';
import type { Skill } from '../../types/message';

interface Props {
  filteredSkills: Skill[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export default function SkillAutocomplete({ filteredSkills, selectedIndex, onSelect, onHover }: Props) {
  if (filteredSkills.length === 0) {
    return (
      <div className="skill-suggestions">
        <div className="skill-suggestions-empty">没有找到匹配的技能</div>
      </div>
    );
  }

  return (
    <div className="skill-suggestions">
      {filteredSkills.map((skill, index) => (
        <div
          key={skill.name}
          className={`skill-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(index)}
          onMouseEnter={() => onHover(index)}
        >
          <div className="skill-name">/{skill.name}</div>
          {skill.description && <div className="skill-description">{skill.description}</div>}
        </div>
      ))}
    </div>
  );
}
