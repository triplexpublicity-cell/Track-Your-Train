package com.trackyourtrain.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TrackYourTrainApp()
        }
    }

    @Composable
    fun TrackYourTrainApp(vm: TrainVM = viewModel()) {

        var from by remember { mutableStateOf("") }
        var to by remember { mutableStateOf("") }
        var selectedDate by remember { mutableStateOf("today") }

        val trains by vm.trains.collectAsState()
        val loading by vm.loading.collectAsState()
        val error by vm.error.collectAsState()

        MaterialTheme {

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Text("Track Your Train")
                        }
                    )
                }
            ) { padding ->

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {

                    item {
                        Text(
                            text = "Find Trains",
                            style = MaterialTheme.typography.headlineSmall
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = from,
                            onValueChange = { from = it },
                            label = { Text("From Station / Code") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = to,
                            onValueChange = { to = it },
                            label = { Text("To Station / Code") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = selectedDate == "today",
                                onClick = { selectedDate = "today" },
                                label = { Text("Today") }
                            )

                            FilterChip(
                                selected = selectedDate == "tomorrow",
                                onClick = { selectedDate = "tomorrow" },
                                label = { Text("Tomorrow") }
                            )
                        }
                    }

                    item {
                        Button(
                            onClick = {
                                vm.searchTrains(
                                    from = from.trim(),
                                    to = to.trim(),
                                    date = selectedDate
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = from.isNotBlank() && to.isNotBlank()
                        ) {
                            Text("Find Trains")
                        }
                    }

                    if (loading) {
                        item {
                            CircularProgressIndicator()
                        }
                    }

                    error?.let { message ->
                        item {
                            Text(
                                text = message,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }

                    items(trains) { train ->

                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {

                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {

                                Text(
                                    text = train.train.name,
                                    style = MaterialTheme.typography.titleLarge
                                )

                                Text(
                                    text = "Train No: ${train.train.number}"
                                )

                                Text(
                                    text = "Departure: ${
                                        train.from.departure ?: "--"
                                    }"
                                )

                                Text(
                                    text = "Arrival: ${
                                        train.to.arrival ?: "--"
                                    }"
                                )

                                Spacer(
                                    modifier = Modifier.height(8.dp)
                                )

                                Row(
                                    horizontalArrangement =
                                        Arrangement.spacedBy(8.dp)
                                ) {

                                    Button(
                                        onClick = {
                                            vm.loadLive(
                                                train.train.number,
                                                selectedDate
                                            )
                                        }
                                    ) {
                                        Text("Live")
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            val intent = Intent(
                                                Intent.ACTION_VIEW,
                                                Uri.parse(
                                                    "https://www.irctc.co.in/eticket/"
                                                )
                                            )
                                            startActivity(intent)
                                        }
                                    ) {
                                        Text("Book on IRCTC")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
