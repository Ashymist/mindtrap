package domains

import (
	"time"
)

type Chain struct {
	OccuredAt       time.Time
	ActivatingEvent string
	Response        string
	FutureAction    string
	Goal            string
	Explanations    []Explanation
	Beliefs         []Belief
	Emotions        []Emotion
}

type Explanation struct {
	Description string
	IsRealistic bool
}

type Belief struct {
	BeliefType              string
	Desctiption             string
	BelievabilityBefore     string
	BelievabilityAfter      string
	Arguments               []Argument
	RationalThoughtOfBelief RationalThought
}

type Argument struct {
	Description string
	IsPositive  bool
}

type RationalThought struct {
	Description   string
	Believability string
}

type Emotion struct {
	EmotionType       string
	Description       string
	isHealthy         bool
	IntensivityBefore string
	IntensivityAfter  string
}
