
import React from "react";
import ReactDOM from "react-dom";
import DataStore from "lib/data-store";
import dispatcher from "lib/dispatcher";
import Character from "components/character";
import LinkList from "components/link-list";
import Filter from "components/filter";
import Loader from "components/loader";
import Tabs from "components/tabs";
import { keys, sortByProperty } from "lib/utils";
import * as CONFIG from "lib/config";


class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: [],
			selectedIndex: 0,
			list: null,
			filter: "",
			isLoaded: false
		};
		this.events = {};
		this.stores = {};
		this.loadedTotal = 0;

		["skills", "adversaries", "weapons", "talents", "qualities"].forEach(key => {
			this.stores[key] = new DataStore(`media/data/${key}.json`);
			this.stores[key].load(() => this.loadedTotal++);
		});
	}

	componentDidMount() {
		this.events["adversaries"] = this.stores.adversaries.on("change", () => {
			let adversaries = this.stores.adversaries.all();

			this._updateState(adversaries.sort(sortByProperty("name"))[0], adversaries);
		});

		keys(this.stores).forEach(key => {
			if(key != "adversaries") {
				this.events[key] = this.stores[key].on("change", () => this._updateState());
			}
		});

		// view object from menu
		dispatcher.register(CONFIG.OBJECT_VIEW, id => {
			this._updateState(this.stores.adversaries.all().find(a => a.id == id));
		});

		// add another object to the view
		dispatcher.register(CONFIG.TAB_ADD, () => {
			let newTab = this.stores.adversaries.all().find(a => a.id == this.state.selected[this.state.selectedIndex].id);

			this.state.selected.push(newTab);
			this._updateState();
		});

		// remove the first non-active tab from the right hand side
		dispatcher.register(CONFIG.TAB_REMOVE, () => {
			for(let i = this.state.selected.length - 1; i >= 0; --i) {
				if(i != this.state.selectedIndex) {
					this.state.selected.splice(i, 1);

					if(i < this.state.selectedIndex) {
						--this.state.selectedIndex;
					}

					this._updateState();

					break;
				}
			}
		});

		// change to a new tab
		dispatcher.register(CONFIG.TAB_CHANGE, index => {
			this.state.selectedIndex = index;
			this._updateState();
		});

		// filter text from menu
		dispatcher.register(CONFIG.MENU_FILTER, filter => {
			let adversaries = this.stores.adversaries.all();

			if(filter != "") {
				filter = filter.toLowerCase();

				adversaries = adversaries.filter(a => a.name.toLowerCase().indexOf(filter) != -1 || a.tags.indexOf(filter) != -1);
			}

			this._updateState(adversaries.length == 1 ? adversaries[0] : null, adversaries);
		});
	}

	_updateState(adversary, list, filter) {
		let selected = null;

		if(adversary) {
			selected = this.state.selected;
			selected[this.state.selectedIndex] = adversary;
		}

		this.setState({
			selected: selected || this.state.selected,
			list:     list     || this.state.list,
			filter:   filter   || this.state.filter,
			isLoaded: this.loadedTotal == keys(this.stores).length,
			selectedIndex: this.state.selectedIndex
		});
	}

	componentWillUnmount() {
		keys(this.stores).forEach(key => this.stores[key].off(this.events[key]));
	}

	render() {
		let x = this.state.list != null ? this.state.list.length : 0;
		let y = this.stores.adversaries !=null ? this.stores.adversaries.all().length : 0;

		return <div>
			<div id="navigation" className="column small">
				<Filter filter={ this.state.filter } />
				<p><small>Showing { x } of { y }.</small></p>
				<LinkList data={ this.state.list } selected={ this.state.selected.length > 0 ? this.state.selected[this.state.selectedIndex].id : "" } />
			</div>
			<div id="content" className="column large">
				{ !this.state.isLoaded
					? <Loader />
					: <div>
						{ this.state.selected.map((selected, index) => <Character key={ index } character={ selected } skills={ this.stores.skills }  weapons={ this.stores.weapons } talents={ this.stores.talents } qualities={ this.stores.qualities } visible={ index == this.state.selectedIndex } />)}
						<Tabs tabs={ this.state.selected.map(c => c.name) } selectedIndex={ this.state.selectedIndex } />
					</div>
				}
			</div>
		</div>;
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("container")
);