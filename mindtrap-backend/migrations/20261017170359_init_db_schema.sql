-- +goose Up
CREATE TABLE events (
    event_id int primary key GENERATED ALWAYS AS IDENTITY,
    occured_at timestamp not NULL,
  	activating_event text not NULL,
    response text,
    future_action text,
    goal text
);

CREATE TABLE explanations (
  explanation_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id int references events (event_id),
  description text NOT NULL,
  is_realistic boolean NOT NULL
);


CREATE TABLE beliefs (
  belief_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id int references events (event_id),
  description text NOT NULL,
  believability_before varchar(5) NOT NULL,
  believabilty_after varchar(5)
  
);

CREATE TABLE rational_thoughts (
  thought_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  belief_id int references beliefs (belief_id),
  description text NOT NULL,
  believability varchar(5)
);



create table arguments(
  argument_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  belief_id int  references beliefs (belief_id),
  description text NOT NULL,
  is_positive boolean not NULL
);

create table emotions (
  emotion_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id int references events (event_id),
  emotion_type varchar(255) NOT NULL,
  description text,
  intensivity_before varchar(5) NOT NULL,
  intensivity_after varchar(5)
);



-- +goose Down
DROP TABLE events;
DROP TABLE beliefs;
DROP TABLE emotions;
DROP TABLE arguments;
DROP TABLE explanations;
DROP TABLE rational_thoughts;
