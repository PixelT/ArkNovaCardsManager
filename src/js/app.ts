import animals from '../animals.json';
import sponsors from '../sponsors.json';

interface IConfig {
    [key: string]: string;
};

interface IDataCards {
    [key: string]: Array<Number>
};
interface IDataStats {
    [key: number | string]: any;
};

interface IDataFilters {
    [key: string]: Array<string> | number;
}

(function() {
    const elForm: HTMLFormElement = document.querySelector(`.filter`);
    const elContentAnimalCards: HTMLDivElement = document.querySelector(`.content__animals`);
    const elContentSponsorCards: HTMLDivElement = document.querySelector(`.content__sponsors`);
    const elContentStats: HTMLDivElement = document.querySelector(`.stats`);
    const elSearchField: HTMLInputElement = document.querySelector(`.action__search`);
    const elFilterAction: HTMLSelectElement = document.querySelector(`.filter__action-form`);

    const config: IConfig = {
        cardsOnStorage: `anc_on`,
        cardsOffStorage: `anc_off`,
        cardsOnClass: `card--on`,
        cardsOffClass: `card--off`
    }

    let dataCards: IDataCards = _setCardsDefault();

    let dataFilters: IDataFilters = {
        category: [`animal`, `sponsor`]
    };

    let dataStats: IDataStats = _setStats();
    let matchingAnimalCards: number = 0;
    let matchingSponsorCards: number = 0;
    
    function _init(): void {
        _registerEvents();
        _displayCards(dataCards.animals, dataCards.sponsors);
        _displayStats(dataStats);
    }

    function _registerEvents(): void {
        elSearchField && elSearchField.addEventListener(`input`, function() {
            let _value: any = this.value;

            if (_value.length > this.maxLength) {
                this.value = _value.slice(0, this.maxLength);
            }
            
            if (_value.length === 3) {
                _value = parseInt(_value);

                if (_value >= 401 && _value <= 528) {
                    const item = animals.data.filter(obj => {
                        return obj[`id`] === _value;
                    });

                    _collectStats([item[0].id], null);
                    _displayCards([_value], null);
                } else if (_value >= 201 && _value <= 264) {
                    const item = sponsors.data.filter(obj => {
                        return obj[`id`] === _value;
                    });

                    _collectStats(null, [item[0].id]);
                    _displayCards(null, [_value]);
                }
            } else {
                _collectCardsData(dataFilters);
                _collectStats(dataCards.animals, dataCards.sponsors);
                _displayCards(dataCards.animals, dataCards.sponsors);
            }

            _displayStats(dataStats);
        });

        elFilterAction.addEventListener('change', () => {
            _updateCards();
        });

        document.addEventListener(`click`, (ev: Event) => {
            const el: HTMLElement = (ev.target as HTMLElement);

            if (el.classList.contains(`filter__label`) || el.classList.contains(`filter__text`)) {
                ev.preventDefault();

                let radioBox: any = undefined;

                if (el.classList.contains(`filter__text`)) {
                    radioBox = (ev.target as HTMLElement).parentElement.previousElementSibling;
                } else {
                    radioBox = (ev.target as HTMLElement).previousElementSibling;
                }
                
                radioBox.checked = !radioBox.checked;
                elSearchField.value = '';
                
                _updateCards();

            } else if (el.classList.contains(`button--filter`)) {
                elSearchField.value = '';
                dataFilters = {};
                dataCards = _setCardsDefault();
                dataStats = _setStats();

                _displayCards(dataCards.animals, dataCards.sponsors);
                _displayStats(dataStats);
            } else if (el.classList.contains(`button--cards`)) {
                ev.preventDefault();
                localStorage.setItem(config.cardsOnStorage, JSON.stringify([]));
                localStorage.setItem(config.cardsOffStorage, JSON.stringify([]));

                _displayCards(dataCards.animals, dataCards.sponsors);
            } else if (el.classList.contains(`filter__action-reset`)) {
                ev.preventDefault();
                elFilterAction.selectedIndex = 0;
 
                _updateCards();
            } else if (el.classList.contains(`card__image`)) {
                ev.preventDefault();
                const card: HTMLElement = el.closest(`.card`);
                let cardID: number = parseInt(card.dataset.id);

                _promise().then(() => {
                    if (!card.classList.contains(config.cardsOffClass) && !card.classList.contains(config.cardsOnClass)) {
                        _addValueToStorage(config.cardsOnStorage, cardID);
                        card.classList.add(config.cardsOnClass);
                    } else if (card.classList.contains(config.cardsOnClass)) {
                        _addValueToStorage(config.cardsOffStorage, cardID);
                        _removeValueFromStorage(config.cardsOnStorage, cardID);
                        card.classList.remove(config.cardsOnClass);
                        card.classList.add(config.cardsOffClass);
                    } else if (card.classList.contains(config.cardsOffClass)) {
                        _removeValueFromStorage(config.cardsOffStorage, cardID);
                        _removeValueFromStorage(config.cardsOnStorage, cardID);
                        card.classList.remove(config.cardsOffClass);
                    }
                });
                    
            } else if (el.classList.contains(`toggle--nav`)) {
                el.closest(`.container__outer`).classList.toggle(`_active`);
            } else if (el.classList.contains(`toggle--stats`)) {
                el.closest(`.container__outer`).classList.toggle(`_active`);
            } else if (el.classList.contains(`action__item--scroll`)) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else if (el.classList.contains(`action__item--search`)) {
                elSearchField.parentElement.classList.toggle(`action--active`);
                elSearchField.focus();
            }
        });
    }

    function _promise(time: number = 0): Promise<Number> {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function _setStats(isDefault: boolean = true) {
        return {
            animal: isDefault ? 128 : 0,
            sponsor: isDefault ? 64 : 0,
            type_2: isDefault ? 25 : 0,
            area_1: isDefault ? 26 : 0,
            type_1: isDefault ? 25 : 0, 
            area_5: isDefault ? 26 : 0,
            type_3: isDefault ? 25 : 0,
            area_3: isDefault ? 27 : 0,
            type_4: isDefault ? 25 : 0,
            area_4: isDefault ? 20 : 0,
            type_5: isDefault ? 18 : 0,
            area_2: isDefault ? 19 : 0,
            size_1: isDefault ? 33 : 0,
            aviary: isDefault ? 10 : 0,
            size_2: isDefault ? 30 : 0,
            terrarium: isDefault ? 25 : 0,
            size_3: isDefault ? 24 : 0,
            rock: isDefault ? 19 : 0,
            size_4: isDefault ? 20 : 0,
            water: isDefault ? 23 : 0,
            size_5: isDefault ? 19 : 0,
            science: isDefault ? 50 : 0,
            action: isDefault ? '' : '',
        }
    }

    function _setCardsDefault() {
        return {
            animals: _getCardsID(animals.data, 'size'),
            sponsors: _getCardsID(sponsors.data, 'id').reverse(),
        }
    }

    function _getCardsID(dataType: Array<any>, sortBy: string) {
        return dataType.sort((a: any, b: any) => {
            if (a[sortBy] < b[sortBy]) return 1;
            if (a[sortBy] > b[sortBy]) return -1;
            return 0;
        }).map(item => item[`id`]);
    }

    function _collectCardsData(dataFilters: any): Object {
        dataCards.animals = [];
        dataCards.sponsors = [];

        _resetCards();

        if (Object.keys(dataFilters).length === 0) {
            elContentAnimalCards.innerHTML = _displayMessage(`Select at least one card type: <strong>Animals</strong> | <strong>Sponsors</strong>`);
        } else if ((Object.keys(dataFilters)?.length === 1 && dataFilters?.category)) {
            dataFilters?.category.includes(`animal`) ? dataCards.animals = _getCardsID(animals.data, 'size') : ``;
            dataFilters?.category.includes(`sponsor`) ? dataCards.sponsors = _getCardsID(sponsors.data, 'id').reverse() : ``;
        } else {
            if (!dataFilters.category) {
                dataCards.animals = [];
                dataCards.sponsors = [];
                elContentAnimalCards.innerHTML = _displayMessage(`Select at least one card type: <strong>Animals</strong> | <strong>Sponsors</strong>`);
            }
            
            if (dataFilters?.category?.includes(`animal`)) {
                Object.entries(animals.data).forEach(element => {
                    for (const property in dataFilters) {
                        if ((dataFilters[property as keyof typeof dataFilters] as any).includes((element[1] as any)[property])) {
                            (dataCards.animals as Array<Number>).push(+element[1][`id`]);
                        }
                    }
                });
            }

            if (dataFilters?.category?.includes(`sponsor`)) {
                Object.entries(sponsors.data).forEach(element => {
                    for (const property in dataFilters) {
                        if (property === `category`) {
                            continue;
                        }

                        if ((dataFilters[property as keyof typeof dataFilters] as any).includes((element[1] as any)[property])) {
                            (dataCards.sponsors as Array<Number>).push(+element[1][`id`]);
                        }
                    }
                });
            }

            const activeFiltersType = Object.keys(dataFilters).length;

            if (!activeFiltersType) {
                dataCards = _setCardsDefault();
            }

            if (activeFiltersType > 1) {
                const dataFilteredAnimals = _filterData(activeFiltersType, dataCards.animals as Array<Number>);

                dataFilteredAnimals.length ? dataCards.animals = dataFilteredAnimals : dataCards.animals = [];
            }
        }
        return dataCards;
    }

    function _collectStats(dataAnimals: Array<Number>, dataSponsors: Array<Number>): void {
        dataStats = _setStats(false);

        if (dataAnimals) {
            dataAnimals.forEach(elem => {
                const item = animals.data.filter(obj => {
                    return obj[`id`] === elem
                });

                if (item[0][`category`] === `animal`) {
                    dataStats[`animal`]++;
                }
    
                if (item[0][`type`] != 0) {
                    dataStats[`type_${item[0][`type`]}`]++;
                }
    
                if (item[0][`area`] != 0) {
                    dataStats[`area_${item[0][`area`]}`]++;
                }
    
                if (item[0][`size`] != 0) {
                    dataStats[`size_${item[0][`size`]}`]++;
                }
                
                item[0][`aviary`] ? dataStats[`aviary`]++ : '';
                item[0][`terrarium`] ? dataStats[`terrarium`]++ : '';
                item[0][`isRock`] ? dataStats[`rock`]++ : '';
                item[0][`isWater`] ? dataStats[`water`]++ : '';
            });
        }

        if (dataSponsors) {
            dataSponsors.forEach(elem => {
                const item = sponsors.data.filter(obj => {
                    return obj[`id`] === elem
                });

                if (item[0][`category`] === `sponsor`) {
                    dataStats[`sponsor`]++;
                }
    
                if (item[0][`type`] != 0) {
                    dataStats[`type_${item[0][`type`]}`]++;
                }
    
                if (item[0][`area`] != 0) {
                    dataStats[`area_${item[0][`area`]}`]++;
                }
                
                item[0][`isRock`] ? dataStats[`rock`]++ : '';
                item[0][`isWater`] ? dataStats[`water`]++ : '';
                item[0][`science`] ? dataStats[`science`]++ : '';
            });
        }
    }

    function _filterData(filters: number, data: Array<Number>): Array<Number> {
        const collection: Object = {};

        // @ts-ignore
        data.forEach(id => { collection[id] = (collection[id] || 0) + 1; });

        return Object.entries(collection).filter(value => {
            return +value[1] >= +filters;
        }).map((item: any) => +item[0]);
    }

    function _displayStats(data: Object) {
        _resetStats();

        let markup = ``;
        const cardsAmount = matchingAnimalCards + matchingSponsorCards;

        markup += `
        <li class="stats__item stats__item--cards">
            <span class="stats__label stats__label--cards">${cardsAmount} ${cardsAmount === 1 ? `card` : `cards`}</span>
        </li>
        `

        Object.entries(data).forEach(([key, value]) => {
            const percentage = value ? +((value / (matchingAnimalCards + matchingSponsorCards)) * 100).toFixed(1) : 0;
            let itemClass: string = `stats__item`;

            if (!value) {
                itemClass = `stats__item stats__item--empty`;
            }
            
            if (key == 'type_null' || key == 'area_null' || key == 'action') {
                return;
            }
            
            markup += `
            <li class="${itemClass} icon icon--${key}" data-id="${key}">
                <span class="stats__label stats__label--cards">${value}x</span>
                <span class="stats__label stats__label--percentage">${percentage}%</span>
            </li>
            `;
        });

        elContentStats.innerHTML = markup;
    }

    function _displayCards(dataAnimals: Array<Number>, dataSponsors: Array<Number>): void {        
        let animalCardsMarkup: string = '';
        let sponsorCardsMarkup: string = '';

        if (dataAnimals?.length) {
            for (const card in dataAnimals) {
                animalCardsMarkup += _card((dataAnimals as any)[card]);
            }
            elContentAnimalCards.innerHTML = animalCardsMarkup;
        } else if ((dataFilters?.category as Array<String>)?.includes(`animal`)) {
            elContentAnimalCards.innerHTML = _displayMessage(`No animals matched`);
        }

        matchingAnimalCards = dataAnimals?.length ? Object.values(dataAnimals).length : 0;

        if (dataSponsors?.length) {
            for (const card in dataSponsors) {
                sponsorCardsMarkup += _card((dataSponsors as any)[card]);
            }
            elContentSponsorCards.innerHTML = sponsorCardsMarkup;
        } else if ((dataFilters?.category as Array<String>)?.includes(`sponsor`)) {
            elContentSponsorCards.innerHTML = _displayMessage(`No sponsors matched`);
        }

        matchingSponsorCards = dataSponsors?.length ? Object.values(dataSponsors).length : 0;
    }

    function _displayMessage(message: string = null): string {
        return message ? `<p class="content__message">${message}</p>` : ``;
    }

    function _updateCards() {
        dataFilters = {};
    
        _promise().then(() => {
            const formData: FormData = new FormData(elForm);

            for (const [key, value] of formData) {
                const objValue = isNaN(value as any) ? value : +value;

                if (key === 'action' && !value) {
                    continue;
                }

                if (dataFilters.hasOwnProperty(key)) {
                    (dataFilters as any)[key].push(objValue);
                } else {
                    Object.assign(dataFilters, {[key]: [objValue]});
                }
            }

            _collectCardsData(dataFilters);
            _collectStats(dataCards.animals, dataCards.sponsors);
            _displayCards(dataCards.animals, dataCards.sponsors);
            _displayStats(dataStats);
        });
    }

    function _resetStats() {
        elContentStats.innerHTML = '';
    }

    function _resetCards() {
        elContentAnimalCards.innerHTML = '';
        elContentSponsorCards.innerHTML = '';
    }

    function _card(id: number): string {       
        let cardStatus = '';
        let cardType = '';

        if (id >= 401 && id <= 528) {
            cardType = 'animal';
        } else if (id >= 201 && id <= 264) {
            cardType = 'sponsor';
        }

        const cardsOn = JSON.parse(localStorage.getItem(config.cardsOnStorage));
        const cardsOff = JSON.parse(localStorage.getItem(config.cardsOffStorage));

        if (cardsOn && cardsOn.includes(+id)) {
            cardStatus = ` ${config.cardsOnClass}`;
        } else if (cardsOff && cardsOff.includes(+id)) {
            cardStatus = ` ${config.cardsOffClass}`;
        }

        return `
            <div class="card card--${cardType}${cardStatus}" data-id="${id}">
                <img src="./dist/images/${cardType}/${id}.jpg" class="card__image" loading="lazy" />
                <div class="card__id">${id}</div>
            </div>
        `;
    }

    function _addValueToStorage(key: string, id: number) {
        const values = JSON.parse(localStorage.getItem(key)) || [];

        if (!values.includes(id)) {
            values.push(id);
            localStorage.setItem(key, JSON.stringify(values));
        };
    }

    function _removeValueFromStorage(key: string, id: number) {
        const values = JSON.parse(localStorage.getItem(key)) || [];
        
        if (values.includes(id)) {
            values.splice(values.indexOf(id), 1);
            localStorage.setItem(key, JSON.stringify(values));
        };
    }

    _init();
}());