
import React from "react";
import { dice } from "lib/utils";

export default class SkillPanel extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			showAll: false,
			minions: 0
		};
	}

	componentWillUpdate(nextProps, nextState) {
		if(nextProps.character !== this.props.character) {
			this.setState({
				showAll: false,
				minions: 0
			})
		}
	}

	toggleSkills() {
		this.setState({
			showAll: !this.state.showAll
		});
	}

	increaseMinions() {
		this.props.setMinions(this.props.minions + 1);
	}
	decreaseMinions() {
		this.props.setMinions(this.props.minions - 1);
	}

	resetMinions() {
		this.props.setMinions(1);
	}

	render() {
		if(this.props.character == null) {
			return null;
		}
		
		let character = this.props.character;
		let skills = [];
		let allSkills = this.props.skills.all();

		allSkills.forEach(skill => {
			if(this.state.showAll || skill.name in character.skills) {
				let stat = character.characteristics[skill.characteristic];
				let value = character.skills[skill.name] || 0;

				if(this.props.minions > 0 && character.type == "Minion" && skill.name in character.skills) {
					value += this.props.minions - 1;
				}

				skills.push({
					"id": skill.id,
					"name": skill.name,
					"value": value,
					"characteristic": skill.characteristic,
					"stat": stat,
					"icons": dice(stat, value),
					"hasRank": this.state.showAll && skill.name in character.skills
				});
			}
		});

		return <div className="info">
			<h2>Skills { character.type == "Minion" ? <small>(Group Only)</small> : null }</h2>
			<small id="show-all" className="btn" onClick={ this.toggleSkills.bind(this) }>{ this.state.showAll ? <span className="fa fa-check-square-o nudge"></span> : <span className="fa fa-square-o nudge"></span> } Show all</small>
			<table className="skills">
				<thead>
					<tr>
						<th>Skill</th>
						<th>Characteristic</th>
						{ character.type != "Minion" ? <th>Rank</th> : null }
						<th>Roll
							{ character.type == "Minion" ?
								<span>
									<small> (for { this.props.minions })</small> 
									<span className="pull-right">
										<span className="link" onClick={ this.increaseMinions.bind(this) } title="Add Minion">&nbsp;+&nbsp;</span> /
										<span className="link" onClick={ this.decreaseMinions.bind(this) } title="Remove Minion">&nbsp;-&nbsp;</span> /
										<span className="link" onClick={ this.resetMinions.bind(this) } title="One Minion">&nbsp;1&nbsp;</span>
									</span>
								</span> : null }
						</th>
					</tr>
				</thead>
				<tbody>
					{  skills.map(s => {
						return <tr key={ s.id }>
							<td>{ s.hasRank ? <strong>{ s.name }</strong> : s.name }</td>
							<td><small>{ s.characteristic }</small></td>
							{ character.type != "Minion" ? <td>{ s.value }</td> : null }
							<td dangerouslySetInnerHTML={ s.icons } />
						</tr>
					})}
				</tbody>
			</table>
		</div>;
	}
}