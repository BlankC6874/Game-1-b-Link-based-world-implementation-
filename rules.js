class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        this.engine.storyData.PreviousLocation = key;
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        if (locationData.ItemToCollect) {
            this.engine.addChoice(`Collect ${locationData.ItemToCollect.Name}`, locationData.ItemToCollect);
        }

        if (locationData.Choices) {
            for (let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        }

        if (locationData.UnlockCondition) {
            const requiredItem = locationData.UnlockCondition.Name;
            const unlockedLocation = locationData.UnlockCondition.UnlocksLocation;
            const hasRequiredItem = this.engine.storyData.InventoryItems.some(item => item.Name === requiredItem);

            if (hasRequiredItem) {
                this.engine.addChoice(`Enter ${unlockedLocation}`, { UnlocksLocation: unlockedLocation });
            }
        }

        if (!locationData.Choices && !locationData.UnlockCondition) {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (choice.Text === "The end.") {
            this.engine.gotoScene(End);
        } else if (choice.Target) {
            this.engine.show(`&gt; ${choice.Text}`);
            this.engine.gotoScene(Location, choice.Target);
        } else if (choice.Name) {
            this.engine.show(`You collected the ${choice.Name}.`);
            this.engine.storyData.InventoryItems.push(choice);
            this.engine.gotoScene(Location, this.engine.storyData.PreviousLocation);
        } else if (choice.UnlocksLocation) {
            this.engine.show(`&gt; Enter ${choice.UnlocksLocation}`);
            this.engine.gotoScene(Location, choice.UnlocksLocation);
        }
    }
}

class ControlRoom extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        for (let control of locationData.Controls) {
            this.engine.addChoice(control.Text, control);
        }
    }

    handleChoice(control) {
        this.engine.show(`&gt; ${control.Text}`);
        this.engine.show(control.Effect);

        if (control.UnlocksLocation) {
            let unlockLocation = this.engine.storyData.Locations[control.UnlocksLocation];
            unlockLocation.Choices.push({
                Text: "Proceed",
                Target: control.UnlocksLocation
            });
            this.engine.show(`A new path has been unlocked: ${control.UnlocksLocation}`);
        }

        this.engine.gotoScene(Location, "Central Hub");
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');